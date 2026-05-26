using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Contracts.Common;
using NexApply.Contracts.SavedJobs;

namespace NexApply.Api.Features.SavedJobs.SaveJob;

public class SaveJobHandler(AppDbContext context, CurrentUser currentUser)
    : IRequestHandler<SaveJobCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(SaveJobCommand request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);

        var student = await context.StudentProfiles
            .FirstOrDefaultAsync(profile => profile.UserId == userId, ct);

        if (student is null)
            return Result<bool>.NotFound("Student profile not found");

        var jobExists = await context.JobListings.AnyAsync(j => j.Id == request.JobListingId, ct);
        if (!jobExists)
            return Result<bool>.NotFound("Job listing not found");

        var alreadySaved = await context.SavedJobs.AnyAsync(s =>
            s.StudentId == student.Id && s.JobListingId == request.JobListingId, ct);

        if (alreadySaved)
            return Result<bool>.Conflict("Job already saved");

        var savedJob = SavedJob.Create(student.Id, request.JobListingId);
        context.SavedJobs.Add(savedJob);
        await context.SaveChangesAsync(ct);

        return Result<bool>.Success(true);
    }
}

