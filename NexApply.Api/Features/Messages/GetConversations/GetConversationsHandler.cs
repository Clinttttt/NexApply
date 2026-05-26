using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Common;
using NexApply.Contracts.Messages;

namespace NexApply.Api.Features.Messages.GetConversations;

public class GetConversationsHandler : IRequestHandler<GetConversationsQuery, Result<List<ConversationDto>>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public GetConversationsHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<ConversationDto>>> Handle(GetConversationsQuery request, CancellationToken ct)
    {
        var userId = Guid.Parse(_currentUser.UserId);
        var isCompany = _currentUser.Role == nameof(UserRole.Company);
        var isStudent = _currentUser.Role == nameof(UserRole.Student);

        StudentProfile? currentStudent = null;
        if (isStudent)
        {
            currentStudent = await _context.StudentProfiles
                .Include(s => s.Resume)
                .FirstOrDefaultAsync(s => s.UserId == userId, ct);
        }

        // Get all messages involving the current user
        var allMessages = await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(ct);

        // Group by conversation partner
        var conversationGroups = allMessages
            .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
            .Select(g => new
            {
                OtherUserId = g.Key,
                LastMessage = g.First()
            })
            .ToList();

        var conversations = new List<ConversationDto>();
        var includedUserIds = new HashSet<Guid>();

        foreach (var conv in conversationGroups)
        {
            var otherUser = await _context.Users
                .Include(u => u.StudentProfile)
                .Include(u => u.CompanyProfile)
                .FirstOrDefaultAsync(u => u.Id == conv.OtherUserId, ct);

            if (otherUser == null) continue;

            Application? application = null;
            List<string>? skillsForDisplay = null;
            var matchScore = 0;

            // Company user chatting with a candidate → find application for context + match score
            if (isCompany && otherUser.Role == UserRole.Student)
            {
                application = await _context.Applications
                    .Include(a => a.JobListing)
                    .Include(a => a.Student)
                        .ThenInclude(s => s.Resume)
                    .Where(a => a.StudentId == otherUser.StudentProfile!.Id && a.JobListing.CompanyId == userId)
                    .OrderByDescending(a => a.CreatedAt)
                    .FirstOrDefaultAsync(ct);

                if (application is not null)
                {
                    skillsForDisplay = SkillMatchScorer.GetSkillsFromJson(application.Student.Resume?.SkillsJson);
                    matchScore = SkillMatchScorer.CalculateMatchScore(application.JobListing.RequiredSkills, application.Student);
                }
            }

            // Student user chatting with a company → find the student's application to that company for context
            if (isStudent && otherUser.Role == UserRole.Company && currentStudent is not null)
            {
                application = await _context.Applications
                    .Include(a => a.JobListing)
                    .Where(a => a.StudentId == currentStudent.Id && a.JobListing.CompanyId == otherUser.Id)
                    .OrderByDescending(a => a.CreatedAt)
                    .FirstOrDefaultAsync(ct);

                if (application is not null)
                    matchScore = SkillMatchScorer.CalculateMatchScore(application.JobListing.RequiredSkills, currentStudent);
            }

            var displayName = otherUser.Role == UserRole.Student
                ? otherUser.StudentProfile!.FullName
                : otherUser.CompanyProfile?.CompanyName ?? otherUser.Username;

            var roleLabel =
                otherUser.Role == UserRole.Student ? (isCompany ? "Candidate" : "Student") :
                otherUser.Role == UserRole.Company ? (isStudent ? "Company" : "Team") :
                "Team";

            conversations.Add(new ConversationDto
            {
                UserId = otherUser.Id,
                Name = displayName,
                Role = roleLabel,
                JobTitle = application?.JobListing.Title ?? "",
                IsRead = conv.LastMessage.ReceiverId == userId ? conv.LastMessage.IsRead : true,
                IsOnline = false,
                LastSenderIsMe = conv.LastMessage.SenderId == userId,
                LastMessage = conv.LastMessage.Content,
                LastMessageAt = conv.LastMessage.CreatedAt,
                ApplicationStage = application?.Status.ToString(),
                MatchScore = matchScore,
                ApplicantId = application?.Id,
                AppliedDate = application?.CreatedAt,
                Skills = skillsForDisplay
            });

            includedUserIds.Add(otherUser.Id);
        }

        if (isCompany)
        {
            var applications = await _context.Applications
                .Include(a => a.Student)
                    .ThenInclude(s => s.User)
                .Include(a => a.Student)
                    .ThenInclude(s => s.Resume)
                .Include(a => a.JobListing)
                .Where(a => a.JobListing.CompanyId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync(ct);

            foreach (var application in applications)
            {
                var studentUserId = application.Student.UserId;
                if (includedUserIds.Contains(studentUserId))
                    continue;

                var latestMessage = allMessages
                    .Where(m => (m.SenderId == userId && m.ReceiverId == studentUserId) ||
                                (m.SenderId == studentUserId && m.ReceiverId == userId))
                    .OrderByDescending(m => m.CreatedAt)
                    .FirstOrDefault();

                conversations.Add(new ConversationDto
                {
                    UserId = studentUserId,
                    Name = application.Student.FullName,
                    Role = "Candidate",
                    JobTitle = application.JobListing.Title,
                    IsRead = latestMessage is null || latestMessage.ReceiverId != userId || latestMessage.IsRead,
                    IsOnline = false,
                    LastSenderIsMe = latestMessage?.SenderId == userId,
                    LastMessage = latestMessage?.Content ?? "No messages yet",
                    LastMessageAt = latestMessage?.CreatedAt ?? application.CreatedAt,
                    ApplicationStage = application.Status.ToString(),
                    MatchScore = SkillMatchScorer.CalculateMatchScore(application.JobListing.RequiredSkills, application.Student),
                    ApplicantId = application.Id,
                    AppliedDate = application.CreatedAt,
                    Skills = SkillMatchScorer.GetSkillsFromJson(application.Student.Resume?.SkillsJson)
                });

                includedUserIds.Add(studentUserId);
            }
        }

        if (isStudent && currentStudent is not null)
        {
            var applications = await _context.Applications
                .Include(a => a.JobListing)
                    .ThenInclude(j => j.Company)
                        .ThenInclude(c => c.CompanyProfile)
                .Where(a => a.StudentId == currentStudent.Id)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync(ct);

            foreach (var application in applications)
            {
                var companyUserId = application.JobListing.CompanyId;
                if (includedUserIds.Contains(companyUserId))
                    continue;

                var latestMessage = allMessages
                    .Where(m => (m.SenderId == userId && m.ReceiverId == companyUserId) ||
                                (m.SenderId == companyUserId && m.ReceiverId == userId))
                    .OrderByDescending(m => m.CreatedAt)
                    .FirstOrDefault();

                var companyName = application.JobListing.Company.CompanyProfile?.CompanyName ?? application.JobListing.Company.Username;

                conversations.Add(new ConversationDto
                {
                    UserId = companyUserId,
                    Name = companyName,
                    Role = "Company",
                    JobTitle = application.JobListing.Title,
                    IsRead = latestMessage is null || latestMessage.ReceiverId != userId || latestMessage.IsRead,
                    IsOnline = false,
                    LastSenderIsMe = latestMessage?.SenderId == userId,
                    LastMessage = latestMessage?.Content ?? "No messages yet",
                    LastMessageAt = latestMessage?.CreatedAt ?? application.CreatedAt,
                    ApplicationStage = application.Status.ToString(),
                    MatchScore = SkillMatchScorer.CalculateMatchScore(application.JobListing.RequiredSkills, currentStudent),
                    ApplicantId = application.Id,
                    AppliedDate = application.CreatedAt,
                    Skills = null
                });

                includedUserIds.Add(companyUserId);
            }
        }

        return Result<List<ConversationDto>>.Success(conversations.OrderByDescending(c => c.LastMessageAt).ToList());
    }
}
