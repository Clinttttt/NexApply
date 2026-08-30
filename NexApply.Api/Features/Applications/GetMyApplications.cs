using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Applications;

public static class GetMyApplications
{
    public sealed record Query : IRequest<Result<List<Response>>>;

    public sealed class Response
    {
        public Guid ApplicationId { get; init; }
        public Guid JobListingId { get; init; }
        public string JobTitle { get; init; } = string.Empty;
        public string CompanyName { get; init; } = string.Empty;
        public string Status { get; init; } = string.Empty;
        public int PipelineStage { get; init; }
        public string JobType { get; init; } = string.Empty;
        public string Location { get; init; } = string.Empty;
        public DateTime AppliedAt { get; init; }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<List<Response>>>
    {
        public async Task<Result<List<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var student = await context.StudentProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(profile => profile.UserId == userId, cancellationToken);

            if (student is null)
            {
                return Result<List<Response>>.NotFound("Student profile not found");
            }

            var applications = await context.Applications
                .AsNoTracking()
                .Where(application => application.StudentId == student.Id)
                .Include(application => application.JobListing)
                    .ThenInclude(listing => listing.Company)
                        .ThenInclude(user => user.CompanyProfile)
                .OrderByDescending(application => application.CreatedAt)
                .Select(application => new Response
                {
                    ApplicationId = application.Id,
                    JobListingId = application.JobListingId,
                    JobTitle = application.JobListing.Title,
                    CompanyName = application.JobListing.Company.CompanyProfile != null
                        ? application.JobListing.Company.CompanyProfile.CompanyName
                        : application.JobListing.Company.Username,
                    Status = MapStatus(application.Status),
                    PipelineStage = MapPipelineStage(application.Status),
                    JobType = application.JobListing.JobType.ToDisplayName(),
                    Location = application.JobListing.Location,
                    AppliedAt = application.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return Result<List<Response>>.Success(applications);
        }

        private static string MapStatus(ApplicationStatus status) => status switch
        {
            ApplicationStatus.Submitted => "Submitted",
            ApplicationStatus.UnderReview => "Under Review",
            ApplicationStatus.Shortlisted => "Shortlisted",
            ApplicationStatus.ForInterview => "For Interview",
            ApplicationStatus.Declined => "Declined",
            ApplicationStatus.Decided => "Decided",
            _ => status.ToString()
        };

        private static int MapPipelineStage(ApplicationStatus status) => status switch
        {
            ApplicationStatus.Submitted => 0,
            ApplicationStatus.UnderReview => 1,
            ApplicationStatus.Shortlisted => 2,
            ApplicationStatus.ForInterview => 3,
            ApplicationStatus.Declined => 4,
            ApplicationStatus.Decided => 4,
            _ => 0
        };
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetMyApplications));
}
