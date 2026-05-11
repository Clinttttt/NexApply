using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Common;
using NexApply.Contracts.Messages;
using System.Text.Json;

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

            var application = otherUser.Role == UserRole.Student
                ? await _context.Applications
                    .Include(a => a.JobListing)
                    .Where(a => a.StudentId == otherUser.StudentProfile!.Id && a.JobListing.CompanyId == userId)
                    .OrderByDescending(a => a.CreatedAt)
                    .FirstOrDefaultAsync(ct)
                : null;

            conversations.Add(new ConversationDto
            {
                UserId = otherUser.Id,
                Name = otherUser.Role == UserRole.Student ? otherUser.StudentProfile!.FullName : otherUser.CompanyProfile!.CompanyName,
                Role = otherUser.Role == UserRole.Student ? "Candidate" : "Team",
                JobTitle = application?.JobListing.Title ?? "",
                IsRead = conv.LastMessage.ReceiverId == userId ? conv.LastMessage.IsRead : true,
                IsOnline = false,
                LastSenderIsMe = conv.LastMessage.SenderId == userId,
                LastMessage = conv.LastMessage.Content,
                LastMessageAt = conv.LastMessage.CreatedAt,
                ApplicationStage = application?.Status.ToString(),
                MatchScore = 0,
                ApplicantId = application?.Id,
                AppliedDate = application?.CreatedAt,
                Skills = null
            });

            includedUserIds.Add(otherUser.Id);
        }

        if (_currentUser.Role == nameof(UserRole.Company))
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
                    MatchScore = 0,
                    ApplicantId = application.Id,
                    AppliedDate = application.CreatedAt,
                    Skills = GetSkills(application.Student.Resume?.SkillsJson)
                });

                includedUserIds.Add(studentUserId);
            }
        }

        return Result<List<ConversationDto>>.Success(conversations.OrderByDescending(c => c.LastMessageAt).ToList());
    }

    private static List<string> GetSkills(string? skillsJson)
    {
        if (string.IsNullOrWhiteSpace(skillsJson))
            return [];

        try
        {
            return JsonSerializer.Deserialize<List<string>>(skillsJson) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }
}
