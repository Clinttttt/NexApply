using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.Interviews;

namespace NexApply.Api.Features.Interviews.GetCompanyInterviews;

public class GetCompanyInterviewsHandler : IRequestHandler<GetCompanyInterviewsQuery, Result<CompanyInterviewsDto>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public GetCompanyInterviewsHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CompanyInterviewsDto>> Handle(GetCompanyInterviewsQuery request, CancellationToken cancellationToken)
    {
        var companyProfile = await _context.CompanyProfiles
            .FirstOrDefaultAsync(cp => cp.UserId == new Guid(_currentUser.UserId), cancellationToken);

        if (companyProfile is null)
            return Result<CompanyInterviewsDto>.NotFound();

        var interviews = await _context.Interviews
            .Include(i => i.Application)
                .ThenInclude(a => a.Student)
            .Include(i => i.Application)
                .ThenInclude(a => a.JobListing)
            .Include(i => i.Panelists)
            .Where(i => i.Application.JobListing.CompanyId == companyProfile.Id)
            .OrderBy(i => i.ScheduledAt)
            .Select(i => new InterviewDto
            {
                Id = i.Id,
                CandidateName = i.Application.Student.FullName ?? "Unknown",
                JobTitle = i.Application.JobListing.Title,
                ScheduledAt = i.ScheduledAt,
                DurationMinutes = i.DurationMinutes,
                Format = i.Format.ToString(),
                Status = i.Status.ToString(),
                Location = i.Location,
                MeetingLink = i.MeetingLink,
                Interviewers = i.Panelists.Select(p => p.Name).ToList(),
                Notes = i.Notes,
                Feedback = i.Feedback,
                Rating = i.Rating,
                Recommendation = i.Recommendation
            })
            .ToListAsync(cancellationToken);

        return Result<CompanyInterviewsDto>.Success(new CompanyInterviewsDto
        {
            Interviews = interviews
        });
    }
}
