using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities.Enums;
using NexApply.Api.Services;
using NexApply.Contracts.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.GetCompanyJobListings;

public class GetCompanyJobListingsHandler : IRequestHandler<GetCompanyJobListingsQuery, Result<List<JobListingSummaryDto>>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public GetCompanyJobListingsHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<JobListingSummaryDto>>> Handle(GetCompanyJobListingsQuery request, CancellationToken ct)
    {
        var companyId = Guid.Parse(_currentUser.UserId);

        var jobListings = await _context.JobListings
            .Where(j => j.CompanyId == companyId)
            .Select(j => new JobListingSummaryDto
            {
                Id = j.Id,
                Title = j.Title,
                Location = j.Location,
                JobType = (int)j.JobType,
                WorkSetup = (int)j.WorkSetup,
                Status = (int)j.Status,
                TotalApplicants = j.Applications.Count,
                CreatedAt = j.CreatedAt,
                Deadline = j.Deadline,
                SalaryMin = j.SalaryMin,
                SalaryMax = j.SalaryMax,
                RequiredSkills = j.RequiredSkills,
                Description = j.Description,
                SubmittedCount = j.Applications.Count(a => a.Status == ApplicationStatus.Submitted),
                UnderReviewCount = j.Applications.Count(a => a.Status == ApplicationStatus.UnderReview),
                ShortlistedCount = j.Applications.Count(a => a.Status == ApplicationStatus.Shortlisted),
                ForInterviewCount = j.Applications.Count(a => a.Status == ApplicationStatus.ForInterview)
            })
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync(ct);

        return Result<List<JobListingSummaryDto>>.Success(jobListings);
    }
}
