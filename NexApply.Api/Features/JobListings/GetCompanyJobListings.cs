using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.JobListings;

public static class GetCompanyJobListings
{
    public sealed record Query : IRequest<Result<List<Response>>>;

    public sealed class Response
    {
        public Guid Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Location { get; init; } = string.Empty;
        public int JobType { get; init; }
        public int WorkSetup { get; init; }
        public int Status { get; init; }
        public int TotalApplicants { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime? Deadline { get; init; }
        public decimal? SalaryMin { get; init; }
        public decimal? SalaryMax { get; init; }
        public string RequiredSkills { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
        public int SubmittedCount { get; init; }
        public int UnderReviewCount { get; init; }
        public int ShortlistedCount { get; init; }
        public int ForInterviewCount { get; init; }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<List<Response>>>
    {
        public async Task<Result<List<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var companyId = Guid.Parse(currentUser.UserId);

            var jobListings = await context.JobListings
                .AsNoTracking()
                .Where(listing => listing.CompanyId == companyId)
                .OrderByDescending(listing => listing.CreatedAt)
                .Select(listing => new Response
                {
                    Id = listing.Id,
                    Title = listing.Title,
                    Location = listing.Location,
                    JobType = (int)listing.JobType,
                    WorkSetup = (int)listing.WorkSetup,
                    Status = (int)listing.Status,
                    TotalApplicants = listing.Applications.Count,
                    CreatedAt = listing.CreatedAt,
                    Deadline = listing.Deadline,
                    SalaryMin = listing.SalaryMin,
                    SalaryMax = listing.SalaryMax,
                    RequiredSkills = listing.RequiredSkills,
                    Description = listing.Description,
                    SubmittedCount = listing.Applications.Count(application => application.Status == ApplicationStatus.Submitted),
                    UnderReviewCount = listing.Applications.Count(application => application.Status == ApplicationStatus.UnderReview),
                    ShortlistedCount = listing.Applications.Count(application => application.Status == ApplicationStatus.Shortlisted),
                    ForInterviewCount = listing.Applications.Count(application => application.Status == ApplicationStatus.ForInterview)
                })
                .ToListAsync(cancellationToken);

            return Result<List<Response>>.Success(jobListings);
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/company", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);
                return result.ToHttpResult();
            })
            .RequireAuthorization(policy => policy.RequireRole("Company"))
            .WithName(nameof(GetCompanyJobListings))
            .Produces<List<Response>>(StatusCodes.Status200OK);
}
