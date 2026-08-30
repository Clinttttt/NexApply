using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.CompanyDashboard;

public static class GetCompanyDashboard
{
    private const int RecentApplicantLimit = 4;
    private const int ActiveListingLimit = 3;

    public sealed record Query : IRequest<Result<Response>>;

    public sealed class Response
    {
        public string CompanyName { get; init; } = string.Empty;
        public string? HiringManagerTitle { get; init; }
        public string? CompanyLogoUrl { get; init; }
        public int AwaitingReview { get; init; }
        public int TotalApplicants { get; init; }
        public int UpcomingInterviews { get; init; }
        public int UnreadMessages { get; init; }
        public int ActiveJobsCount { get; init; }
        public List<RecentApplicant> RecentApplicants { get; init; } = [];
        public List<ActiveListing> ActiveListings { get; init; } = [];
    }

    public sealed class RecentApplicant
    {
        public Guid ApplicationId { get; init; }
        public string StudentName { get; init; } = string.Empty;
        public string JobTitle { get; init; } = string.Empty;
        public string Status { get; init; } = string.Empty;
        public DateTime AppliedAt { get; init; }
    }

    public sealed class ActiveListing
    {
        public Guid JobListingId { get; init; }
        public string Title { get; init; } = string.Empty;
        public string JobType { get; init; } = string.Empty;
        public string WorkSetup { get; init; } = string.Empty;
        public int ApplicantCount { get; init; }
        public DateTime PostedAt { get; init; }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<Response>>
    {
        public async Task<Result<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            var companyId = Guid.Parse(currentUser.UserId);

            var companyProfile = await context.CompanyProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(profile => profile.UserId == companyId, cancellationToken);

            var awaitingReview = await context.Applications
                .CountAsync(
                    application => application.JobListing.CompanyId == companyId
                        && application.Status == ApplicationStatus.Submitted,
                    cancellationToken);

            var totalApplicants = await context.Applications
                .CountAsync(application => application.JobListing.CompanyId == companyId, cancellationToken);

            var activeJobsCount = await context.JobListings
                .CountAsync(
                    listing => listing.CompanyId == companyId && listing.Status == JobListingStatus.Active,
                    cancellationToken);

            var upcomingInterviews = await context.Interviews
                .CountAsync(
                    interview => interview.Application.JobListing.CompanyId == companyId
                        && interview.Status == InterviewStatus.Scheduled
                        && interview.ScheduledAt >= DateTime.UtcNow,
                    cancellationToken);

            var unreadMessages = await context.Messages
                .CountAsync(message => message.ReceiverId == companyId && !message.IsRead, cancellationToken);

            var recentApplicants = await context.Applications
                .AsNoTracking()
                .Where(application => application.JobListing.CompanyId == companyId)
                .OrderByDescending(application => application.CreatedAt)
                .Take(RecentApplicantLimit)
                .Select(application => new RecentApplicant
                {
                    ApplicationId = application.Id,
                    StudentName = application.Student.FullName,
                    JobTitle = application.JobListing.Title,
                    Status = FormatStatus(application.Status),
                    AppliedAt = application.CreatedAt
                })
                .ToListAsync(cancellationToken);

            var activeListings = await context.JobListings
                .AsNoTracking()
                .Where(listing => listing.CompanyId == companyId && listing.Status == JobListingStatus.Active)
                .OrderByDescending(listing => listing.CreatedAt)
                .Take(ActiveListingLimit)
                .Select(listing => new ActiveListing
                {
                    JobListingId = listing.Id,
                    Title = listing.Title,
                    JobType = listing.JobType.ToString(),
                    WorkSetup = listing.WorkSetup.ToString(),
                    ApplicantCount = listing.Applications.Count,
                    PostedAt = listing.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return Result<Response>.Success(new Response
            {
                CompanyName = companyProfile?.CompanyName ?? string.Empty,
                HiringManagerTitle = companyProfile?.HiringManagerTitle,
                CompanyLogoUrl = companyProfile?.LogoUrl,
                AwaitingReview = awaitingReview,
                TotalApplicants = totalApplicants,
                ActiveJobsCount = activeJobsCount,
                UpcomingInterviews = upcomingInterviews,
                UnreadMessages = unreadMessages,
                RecentApplicants = recentApplicants,
                ActiveListings = activeListings
            });
        }

        private static string FormatStatus(ApplicationStatus status) => status switch
        {
            ApplicationStatus.Submitted => "Submitted",
            ApplicationStatus.UnderReview => "Under Review",
            ApplicationStatus.Shortlisted => "Shortlisted",
            ApplicationStatus.ForInterview => "Interview",
            ApplicationStatus.Declined => "Declined",
            ApplicationStatus.Decided => "Decided",
            _ => "Submitted"
        };
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetCompanyDashboard))
            .Produces<Response>(StatusCodes.Status200OK);
}
