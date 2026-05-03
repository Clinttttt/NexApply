using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Common;
using NexApply.Contracts.Interviews;

namespace NexApply.Api.Features.Interviews.ScheduleInterview;

public class ScheduleInterviewHandler : IRequestHandler<ScheduleInterviewCommand, Result<InterviewDto>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public ScheduleInterviewHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<InterviewDto>> Handle(ScheduleInterviewCommand request, CancellationToken cancellationToken)
    {
        // Verify company profile exists
        var companyProfile = await _context.CompanyProfiles
            .FirstOrDefaultAsync(cp => cp.UserId == Guid.Parse(_currentUser.UserId), cancellationToken);

        if (companyProfile is null)
            return Result<InterviewDto>.NotFound();

        Application? application;
        StudentProfile? student;
        JobListing? jobListing;

        // Scenario 1: Scheduling from existing application
        if (request.ApplicationId.HasValue)
        {
            application = await _context.Applications
                .Include(a => a.JobListing)
                .Include(a => a.Student)
                .FirstOrDefaultAsync(a => a.Id == request.ApplicationId.Value, cancellationToken);

            if (application is null)
                return Result<InterviewDto>.NotFound();

            if (application.JobListing.CompanyId != companyProfile.Id)
                return Result<InterviewDto>.Forbidden();

            student = application.Student;
            jobListing = application.JobListing;
        }
        // Scenario 2: Direct scheduling (no application exists)
        else if (request.StudentId.HasValue && request.JobListingId.HasValue)
        {
            student = await _context.StudentProfiles
                .FirstOrDefaultAsync(s => s.Id == request.StudentId.Value, cancellationToken);

            if (student is null)
                return Result<InterviewDto>.NotFound();

            jobListing = await _context.JobListings
                .FirstOrDefaultAsync(j => j.Id == request.JobListingId.Value, cancellationToken);

            if (jobListing is null)
                return Result<InterviewDto>.NotFound();

            if (jobListing.CompanyId != companyProfile.Id)
                return Result<InterviewDto>.Forbidden();

            // Create application automatically
            application = Application.Create(
                request.StudentId.Value,
                request.JobListingId.Value,
                null, // No cover letter
                null  // No resume URL
            );
            application.MoveToInterview(); // Set status to ForInterview
            _context.Applications.Add(application);
            await _context.SaveChangesAsync(cancellationToken);
        }
        else
        {
            return Result<InterviewDto>.Failure("Either ApplicationId or both StudentId and JobListingId must be provided", 400);
        }

        // Parse format enum
        if (!Enum.TryParse<InterviewFormat>(request.Format.Replace(" ", ""), true, out var format))
            return Result<InterviewDto>.Failure("Invalid interview format", 400);

        // Create interview
        var interview = Interview.Create(
            application.Id,
            request.ScheduledAt,
            request.DurationMinutes,
            format,
            request.Location,
            request.MeetingLink,
            request.Notes
        );

        _context.Interviews.Add(interview);
        await _context.SaveChangesAsync(cancellationToken);

        // Add panelists
        if (request.InterviewerNames.Any())
        {
            foreach (var name in request.InterviewerNames.Where(n => !string.IsNullOrWhiteSpace(n)))
            {
                var panelist = InterviewPanelist.Create(interview.Id, name.Trim(), null, null);
                _context.InterviewPanelists.Add(panelist);
            }
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Return DTO
        var dto = new InterviewDto
        {
            Id = interview.Id,
            CandidateName = student.FullName ?? "Unknown",
            JobTitle = jobListing.Title,
            ScheduledAt = interview.ScheduledAt,
            DurationMinutes = interview.DurationMinutes,
            Format = interview.Format.ToString(),
            Status = interview.Status.ToString(),
            Location = interview.Location,
            MeetingLink = interview.MeetingLink,
            Interviewers = request.InterviewerNames.Where(n => !string.IsNullOrWhiteSpace(n)).Select(n => n.Trim()).ToList(),
            Notes = interview.Notes
        };

        return Result<InterviewDto>.Success(dto);
    }
}
