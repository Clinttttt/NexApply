using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.JobListings;

public static class GetJobListingDetails
{
    public sealed record Query(Guid JobListingId) : IRequest<Result<Response>>;

    public sealed class Response
    {
        public Guid Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
        public string Responsibilities { get; init; } = string.Empty;
        public string Qualifications { get; init; } = string.Empty;
        public string RequiredSkills { get; init; } = string.Empty;
        public string? Benefits { get; init; }
        public string Location { get; init; } = string.Empty;
        public string JobType { get; init; } = string.Empty;
        public string WorkSetup { get; init; } = string.Empty;
        public decimal? SalaryMin { get; init; }
        public decimal? SalaryMax { get; init; }
        public string? ExperienceLevel { get; init; }
        public int Openings { get; init; }
        public DateTime? Deadline { get; init; }
        public string Status { get; init; } = string.Empty;
        public DateTime CreatedAt { get; init; }
        public string CompanyName { get; init; } = string.Empty;
        public string? CompanyLogoUrl { get; init; }
        public int TotalApplicants { get; init; }
        public int DaysLeft { get; init; }
        public int ShortlistedCount { get; init; }
        public int SubmittedCount { get; init; }
        public int UnderReviewCount { get; init; }
        public int ForInterviewCount { get; init; }
        public int DeclinedCount { get; init; }
    }

    public sealed class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(query => query.JobListingId)
                .NotEmpty().WithMessage("Job listing ID is required.");
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<Response>>
    {
        private const string UnknownCompany = "Unknown Company";

        public async Task<Result<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            var jobListing = await context.JobListings
                .AsNoTracking()
                .Include(listing => listing.Company)
                    .ThenInclude(company => company.CompanyProfile)
                .Include(listing => listing.Applications)
                .FirstOrDefaultAsync(listing => listing.Id == request.JobListingId, cancellationToken);

            if (jobListing is null)
            {
                return Result<Response>.NotFound();
            }

            if (jobListing.CompanyId.ToString() != currentUser.UserId)
            {
                return Result<Response>.Forbidden();
            }

            return Result<Response>.Success(new Response
            {
                Id = jobListing.Id,
                Title = jobListing.Title,
                Description = jobListing.Description,
                Responsibilities = jobListing.Responsibilities,
                Qualifications = jobListing.Qualifications,
                RequiredSkills = jobListing.RequiredSkills,
                Benefits = jobListing.Benefits,
                Location = jobListing.Location,
                JobType = jobListing.JobType.ToString(),
                WorkSetup = jobListing.WorkSetup.ToString(),
                SalaryMin = jobListing.SalaryMin,
                SalaryMax = jobListing.SalaryMax,
                ExperienceLevel = jobListing.ExperienceLevel,
                Openings = jobListing.Openings,
                Deadline = jobListing.Deadline,
                Status = jobListing.Status.ToString(),
                CreatedAt = jobListing.CreatedAt,
                CompanyName = jobListing.Company.CompanyProfile?.CompanyName ?? UnknownCompany,
                CompanyLogoUrl = jobListing.Company.CompanyProfile?.LogoUrl,
                TotalApplicants = jobListing.Applications.Count,
                DaysLeft = CalculateDaysLeft(jobListing.Deadline),
                ShortlistedCount = CountByStatus(jobListing, ApplicationStatus.Shortlisted),
                SubmittedCount = CountByStatus(jobListing, ApplicationStatus.Submitted),
                UnderReviewCount = CountByStatus(jobListing, ApplicationStatus.UnderReview),
                ForInterviewCount = CountByStatus(jobListing, ApplicationStatus.ForInterview),
                DeclinedCount = CountByStatus(jobListing, ApplicationStatus.Declined)
            });
        }

        private static int CalculateDaysLeft(DateTime? deadline) =>
            deadline.HasValue
                ? Math.Max(0, (deadline.Value.Date - DateTime.UtcNow.Date).Days)
                : 0;

        private static int CountByStatus(Domain.JobListing jobListing, ApplicationStatus status) =>
            jobListing.Applications.Count(application => application.Status == status);
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/{id:guid}/details", async (
                [FromRoute] Guid id,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(id), cancellationToken);
                return result.ToHttpResult();
            })
            .RequireAuthorization(policy => policy.RequireRole("Company"))
            .WithName(nameof(GetJobListingDetails))
            .Produces<Response>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);
}
