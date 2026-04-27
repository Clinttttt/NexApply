using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.GetJobListingDetails;

public class GetJobListingDetailsHandler : IRequestHandler<GetJobListingDetailsQuery, Result<JobListingDetailsDto>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public GetJobListingDetailsHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<JobListingDetailsDto>> Handle(GetJobListingDetailsQuery request, CancellationToken cancellationToken)
    {
        var jobListing = await _context.JobListings
            .Include(j => j.Company)
            .ThenInclude(c => c.CompanyProfile)
            .Include(j => j.Applications)
            .FirstOrDefaultAsync(j => j.Id == request.JobListingId, cancellationToken);

        if (jobListing is null)
            return Result<JobListingDetailsDto>.NotFound();

        // Verify the job listing belongs to the current company
        if (jobListing.CompanyId.ToString() != _currentUser.UserId)
            return Result<JobListingDetailsDto>.Forbidden();

        var daysLeft = jobListing.Deadline.HasValue
            ? Math.Max(0, (jobListing.Deadline.Value.Date - DateTime.UtcNow.Date).Days)
            : 0;

        var dto = new JobListingDetailsDto
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
            CompanyName = jobListing.Company?.CompanyProfile?.CompanyName ?? "Unknown Company",
            CompanyLogoUrl = jobListing.Company?.CompanyProfile?.LogoUrl,
            TotalApplicants = jobListing.Applications.Count,
            DaysLeft = daysLeft,
            ShortlistedCount = jobListing.Applications.Count(a => a.Status == ApplicationStatus.Shortlisted),
            SubmittedCount = jobListing.Applications.Count(a => a.Status == ApplicationStatus.Submitted),
            UnderReviewCount = jobListing.Applications.Count(a => a.Status == ApplicationStatus.UnderReview),
            ForInterviewCount = jobListing.Applications.Count(a => a.Status == ApplicationStatus.ForInterview),
            DeclinedCount = jobListing.Applications.Count(a => a.Status == ApplicationStatus.Declined),
        };

        return Result<JobListingDetailsDto>.Success(dto);
    }
}
