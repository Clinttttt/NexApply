using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Applications;
using NexApply.Contracts.Common;

namespace NexApply.Api.Features.Applications.Apply;

public class ApplyHandler(AppDbContext context, CurrentUser currentUser)
    : IRequestHandler<ApplyCommand, Result<ApplyResponseDto>>
{
    public async Task<Result<ApplyResponseDto>> Handle(ApplyCommand request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);

        var student = await context.StudentProfiles
            .FirstOrDefaultAsync(profile => profile.UserId == userId, ct);

        if (student is null)
            return Result<ApplyResponseDto>.NotFound("Student profile not found");

        var jobListing = await context.JobListings
            .FirstOrDefaultAsync(job => job.Id == request.JobListingId, ct);

        if (jobListing is null)
            return Result<ApplyResponseDto>.NotFound("Job listing not found");

        if (jobListing.Status != JobListingStatus.Active)
            return Result<ApplyResponseDto>.Failure("This job is no longer accepting applications", 400);

        var alreadyApplied = await context.Applications
            .AnyAsync(application =>
                application.StudentId == student.Id
                && application.JobListingId == request.JobListingId,
                ct);

        if (alreadyApplied)
            return Result<ApplyResponseDto>.Conflict("You have already applied to this job");

        var application = Application.Create(
            student.Id,
            request.JobListingId,
            request.CoverLetter,
            request.ResumeUrl);

        context.Applications.Add(application);
        await context.SaveChangesAsync(ct);

        return Result<ApplyResponseDto>.Success(new ApplyResponseDto
        {
            ApplicationId = application.Id,
            JobListingId = application.JobListingId,
            Status = application.Status.ToString(),
            AppliedAt = application.CreatedAt
        });
    }
}
