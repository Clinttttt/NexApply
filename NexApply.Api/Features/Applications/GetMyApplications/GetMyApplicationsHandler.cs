using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Applications;
using NexApply.Contracts.Common;

namespace NexApply.Api.Features.Applications.GetMyApplications;

public class GetMyApplicationsHandler(AppDbContext context, CurrentUser currentUser)
    : IRequestHandler<GetMyApplicationsQuery, Result<List<StudentApplicationDto>>>
{
    public async Task<Result<List<StudentApplicationDto>>> Handle(GetMyApplicationsQuery request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);

        var student = await context.StudentProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(profile => profile.UserId == userId, ct);

        if (student is null)
            return Result<List<StudentApplicationDto>>.NotFound("Student profile not found");

        var applications = await context.Applications
            .AsNoTracking()
            .Where(a => a.StudentId == student.Id)
            .Include(a => a.JobListing)
                .ThenInclude(j => j.Company)
                    .ThenInclude(u => u.CompanyProfile)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new StudentApplicationDto
            {
                ApplicationId = a.Id,
                JobListingId = a.JobListingId,
                JobTitle = a.JobListing.Title,
                CompanyName = a.JobListing.Company.CompanyProfile != null
                    ? a.JobListing.Company.CompanyProfile.CompanyName
                    : a.JobListing.Company.Username,
                Status = MapStatus(a.Status),
                PipelineStage = MapPipelineStage(a.Status),
                JobType = MapJobType(a.JobListing.JobType),
                Location = a.JobListing.Location,
                AppliedAt = a.CreatedAt
            })
            .ToListAsync(ct);

        return Result<List<StudentApplicationDto>>.Success(applications);
    }

    private static string MapStatus(ApplicationStatus status) => status switch
    {
        ApplicationStatus.Submitted => "Submitted",
        ApplicationStatus.UnderReview => "Under Review",
        ApplicationStatus.Shortlisted => "Shortlisted",
        ApplicationStatus.ForInterview => "For Interview",
        ApplicationStatus.Declined => "Declined",
        _ => status.ToString()
    };

    private static int MapPipelineStage(ApplicationStatus status) => status switch
    {
        ApplicationStatus.Submitted => 0,
        ApplicationStatus.UnderReview => 1,
        ApplicationStatus.Shortlisted => 2,
        ApplicationStatus.ForInterview => 3,
        ApplicationStatus.Declined => 4,
        _ => 0
    };

    private static string MapJobType(JobType jobType) => jobType switch
    {
        JobType.FullTime => "Full-time",
        JobType.PartTime => "Part-time",
        JobType.Internship => "Internship",
        JobType.Freelance => "Freelance",
        JobType.Remote => "Remote",
        _ => jobType.ToString()
    };
}

