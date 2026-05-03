using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyDashboard;

namespace NexApply.Api.Features.CompanyDashboard.GetCompanyDashboard;

public class GetCompanyDashboardHandler : IRequestHandler<GetCompanyDashboardQuery, Result<CompanyDashboardDto>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public GetCompanyDashboardHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CompanyDashboardDto>> Handle(GetCompanyDashboardQuery request, CancellationToken ct)
    {
        var companyId = Guid.Parse(_currentUser.UserId);

        var awaitingReview = await _context.Applications
            .Where(a => a.JobListing.CompanyId == companyId && a.Status == Entities.Enums.ApplicationStatus.Submitted)
            .CountAsync(ct);

        var recentApplicants = await _context.Applications
            .Where(a => a.JobListing.CompanyId == companyId)
            .OrderByDescending(a => a.CreatedAt)
            .Take(4)
            .Select(a => new RecentApplicantDto
            {
                ApplicationId = a.Id,
                StudentName = a.Student.FullName,
                JobTitle = a.JobListing.Title,
                Status = a.Status.ToString(),
                AppliedAt = a.CreatedAt
            })
            .ToListAsync(ct);

        var activeListings = await _context.JobListings
            .Where(j => j.CompanyId == companyId && j.Status == Entities.Enums.JobListingStatus.Active)
            .OrderByDescending(j => j.CreatedAt)
            .Take(3)
            .Select(j => new ActiveListingDto
            {
                JobListingId = j.Id,
                Title = j.Title,
                JobType = j.JobType.ToString(),
                WorkSetup = j.WorkSetup.ToString(),
                ApplicantCount = j.Applications.Count,
                PostedAt = j.CreatedAt
            })
            .ToListAsync(ct);

        var dashboard = new CompanyDashboardDto
        {
            AwaitingReview = awaitingReview,
            UpcomingInterviews = 0,
            UnreadMessages = 0,
            RecentApplicants = recentApplicants,
            ActiveListings = activeListings
        };

        return Result<CompanyDashboardDto>.Success(dashboard);
    }
}
