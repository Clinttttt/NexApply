using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Messages;

public static class GetConversations
{
    public sealed record Query : IRequest<Result<List<Response>>>;

    public sealed class Response
    {
        public Guid UserId { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Role { get; init; } = string.Empty;
        public string JobTitle { get; init; } = string.Empty;
        public bool IsRead { get; init; }
        public bool IsOnline { get; init; }
        public bool LastSenderIsMe { get; init; }
        public string LastMessage { get; init; } = string.Empty;
        public DateTime LastMessageAt { get; init; }
        public string? ApplicationStage { get; init; }
        public int MatchScore { get; init; }
        public Guid? ApplicantId { get; init; }
        public DateTime? AppliedDate { get; init; }
        public List<string>? Skills { get; init; }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<List<Response>>>
    {
        private const string NoMessagesYet = "No messages yet";

        public async Task<Result<List<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);
            var isCompany = currentUser.Role == nameof(UserRole.Company);
            var isStudent = currentUser.Role == nameof(UserRole.Student);

            var currentStudent = isStudent
                ? await context.StudentProfiles
                    .AsNoTracking()
                    .Include(profile => profile.Resume)
                    .FirstOrDefaultAsync(profile => profile.UserId == userId, cancellationToken)
                : null;

            var messages = await context.Messages
                .AsNoTracking()
                .Where(message => message.SenderId == userId || message.ReceiverId == userId)
                .OrderByDescending(message => message.CreatedAt)
                .ToListAsync(cancellationToken);

            var conversations = new List<Response>();
            var includedUserIds = new HashSet<Guid>();

            foreach (var conversation in GroupByPartner(messages, userId))
            {
                var response = await BuildFromMessagesAsync(
                    conversation.PartnerId,
                    conversation.LastMessage,
                    userId,
                    isCompany,
                    isStudent,
                    currentStudent,
                    cancellationToken);

                if (response is null)
                {
                    continue;
                }

                conversations.Add(response);
                includedUserIds.Add(response.UserId);
            }

            if (isCompany)
            {
                conversations.AddRange(
                    await BuildCompanyApplicantConversationsAsync(userId, messages, includedUserIds, cancellationToken));
            }

            if (isStudent && currentStudent is not null)
            {
                conversations.AddRange(
                    await BuildStudentApplicationConversationsAsync(
                        userId,
                        currentStudent,
                        messages,
                        includedUserIds,
                        cancellationToken));
            }

            return Result<List<Response>>.Success(
                conversations.OrderByDescending(conversation => conversation.LastMessageAt).ToList());
        }

        private static IEnumerable<(Guid PartnerId, Message LastMessage)> GroupByPartner(
            List<Message> messages,
            Guid userId) =>
            messages
                .GroupBy(message => message.SenderId == userId ? message.ReceiverId : message.SenderId)
                .Select(group => (PartnerId: group.Key, LastMessage: group.First()));

        private async Task<Response?> BuildFromMessagesAsync(
            Guid partnerId,
            Message lastMessage,
            Guid userId,
            bool isCompany,
            bool isStudent,
            StudentProfile? currentStudent,
            CancellationToken cancellationToken)
        {
            var partner = await context.Users
                .AsNoTracking()
                .Include(user => user.StudentProfile)
                .Include(user => user.CompanyProfile)
                .FirstOrDefaultAsync(user => user.Id == partnerId, cancellationToken);

            if (partner is null)
            {
                return null;
            }

            Application? application = null;
            List<string>? skills = null;
            var matchScore = 0;

            if (isCompany && partner.Role == UserRole.Student && partner.StudentProfile is not null)
            {
                application = await context.Applications
                    .AsNoTracking()
                    .Include(candidate => candidate.JobListing)
                    .Include(candidate => candidate.Student)
                        .ThenInclude(student => student.Resume)
                    .Where(candidate => candidate.StudentId == partner.StudentProfile.Id
                        && candidate.JobListing.CompanyId == userId)
                    .OrderByDescending(candidate => candidate.CreatedAt)
                    .FirstOrDefaultAsync(cancellationToken);

                if (application is not null)
                {
                    skills = SkillMatchScorer.GetSkillsFromJson(application.Student.Resume?.SkillsJson);
                    matchScore = SkillMatchScorer.CalculateMatchScore(
                        application.JobListing.RequiredSkills,
                        application.Student);
                }
            }

            if (isStudent && partner.Role == UserRole.Company && currentStudent is not null)
            {
                application = await context.Applications
                    .AsNoTracking()
                    .Include(candidate => candidate.JobListing)
                    .Where(candidate => candidate.StudentId == currentStudent.Id
                        && candidate.JobListing.CompanyId == partner.Id)
                    .OrderByDescending(candidate => candidate.CreatedAt)
                    .FirstOrDefaultAsync(cancellationToken);

                if (application is not null)
                {
                    matchScore = SkillMatchScorer.CalculateMatchScore(
                        application.JobListing.RequiredSkills,
                        currentStudent);
                }
            }

            return new Response
            {
                UserId = partner.Id,
                Name = ResolveDisplayName(partner),
                Role = ResolveRoleLabel(partner.Role, isCompany, isStudent),
                JobTitle = application?.JobListing.Title ?? string.Empty,
                IsRead = lastMessage.ReceiverId != userId || lastMessage.IsRead,
                IsOnline = false,
                LastSenderIsMe = lastMessage.SenderId == userId,
                LastMessage = lastMessage.Content,
                LastMessageAt = lastMessage.CreatedAt,
                ApplicationStage = application?.Status.ToString(),
                MatchScore = matchScore,
                ApplicantId = application?.Id,
                AppliedDate = application?.CreatedAt,
                Skills = skills
            };
        }

        private async Task<List<Response>> BuildCompanyApplicantConversationsAsync(
            Guid userId,
            List<Message> messages,
            HashSet<Guid> includedUserIds,
            CancellationToken cancellationToken)
        {
            var applications = await context.Applications
                .AsNoTracking()
                .Include(application => application.Student)
                    .ThenInclude(student => student.User)
                .Include(application => application.Student)
                    .ThenInclude(student => student.Resume)
                .Include(application => application.JobListing)
                .Where(application => application.JobListing.CompanyId == userId)
                .OrderByDescending(application => application.CreatedAt)
                .ToListAsync(cancellationToken);

            var conversations = new List<Response>();

            foreach (var application in applications)
            {
                var studentUserId = application.Student.UserId;
                if (!includedUserIds.Add(studentUserId))
                {
                    continue;
                }

                var lastMessage = FindLastMessage(messages, userId, studentUserId);

                conversations.Add(new Response
                {
                    UserId = studentUserId,
                    Name = application.Student.FullName,
                    Role = "Candidate",
                    JobTitle = application.JobListing.Title,
                    IsRead = lastMessage is null || lastMessage.ReceiverId != userId || lastMessage.IsRead,
                    IsOnline = false,
                    LastSenderIsMe = lastMessage?.SenderId == userId,
                    LastMessage = lastMessage?.Content ?? NoMessagesYet,
                    LastMessageAt = lastMessage?.CreatedAt ?? application.CreatedAt,
                    ApplicationStage = application.Status.ToString(),
                    MatchScore = SkillMatchScorer.CalculateMatchScore(
                        application.JobListing.RequiredSkills,
                        application.Student),
                    ApplicantId = application.Id,
                    AppliedDate = application.CreatedAt,
                    Skills = SkillMatchScorer.GetSkillsFromJson(application.Student.Resume?.SkillsJson)
                });
            }

            return conversations;
        }

        private async Task<List<Response>> BuildStudentApplicationConversationsAsync(
            Guid userId,
            StudentProfile currentStudent,
            List<Message> messages,
            HashSet<Guid> includedUserIds,
            CancellationToken cancellationToken)
        {
            var applications = await context.Applications
                .AsNoTracking()
                .Include(application => application.JobListing)
                    .ThenInclude(listing => listing.Company)
                        .ThenInclude(company => company.CompanyProfile)
                .Where(application => application.StudentId == currentStudent.Id)
                .OrderByDescending(application => application.CreatedAt)
                .ToListAsync(cancellationToken);

            var conversations = new List<Response>();

            foreach (var application in applications)
            {
                var companyUserId = application.JobListing.CompanyId;
                if (!includedUserIds.Add(companyUserId))
                {
                    continue;
                }

                var lastMessage = FindLastMessage(messages, userId, companyUserId);
                var company = application.JobListing.Company;

                conversations.Add(new Response
                {
                    UserId = companyUserId,
                    Name = company.CompanyProfile?.CompanyName ?? company.Username,
                    Role = "Company",
                    JobTitle = application.JobListing.Title,
                    IsRead = lastMessage is null || lastMessage.ReceiverId != userId || lastMessage.IsRead,
                    IsOnline = false,
                    LastSenderIsMe = lastMessage?.SenderId == userId,
                    LastMessage = lastMessage?.Content ?? NoMessagesYet,
                    LastMessageAt = lastMessage?.CreatedAt ?? application.CreatedAt,
                    ApplicationStage = application.Status.ToString(),
                    MatchScore = SkillMatchScorer.CalculateMatchScore(
                        application.JobListing.RequiredSkills,
                        currentStudent),
                    ApplicantId = application.Id,
                    AppliedDate = application.CreatedAt
                });
            }

            return conversations;
        }

        private static Message? FindLastMessage(List<Message> messages, Guid userId, Guid partnerId) =>
            messages
                .Where(message =>
                    (message.SenderId == userId && message.ReceiverId == partnerId)
                    || (message.SenderId == partnerId && message.ReceiverId == userId))
                .OrderByDescending(message => message.CreatedAt)
                .FirstOrDefault();

        private static string ResolveDisplayName(User partner) =>
            partner.Role == UserRole.Student
                ? partner.StudentProfile?.FullName ?? partner.Username
                : partner.CompanyProfile?.CompanyName ?? partner.Username;

        private static string ResolveRoleLabel(UserRole role, bool isCompany, bool isStudent) => role switch
        {
            UserRole.Student => isCompany ? "Candidate" : "Student",
            UserRole.Company => isStudent ? "Company" : "Team",
            _ => "Team"
        };
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/conversations", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetConversations))
            .Produces<List<Response>>(StatusCodes.Status200OK);
}
