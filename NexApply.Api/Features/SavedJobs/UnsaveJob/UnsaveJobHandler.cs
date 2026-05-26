using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.SavedJobs;

namespace NexApply.Api.Features.SavedJobs.UnsaveJob;

public class UnsaveJobHandler(AppDbContext context, CurrentUser currentUser)
    : IRequestHandler<UnsaveJobCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(UnsaveJobCommand request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);

        var student = await context.StudentProfiles
            .FirstOrDefaultAsync(profile => profile.UserId == userId, ct);

        if (student is null)
            return Result<bool>.NotFound("Student profile not found");

        var saved = await context.SavedJobs.FirstOrDefaultAsync(s =>
            s.StudentId == student.Id && s.JobListingId == request.JobListingId, ct);

        if (saved is null)
            return Result<bool>.NotFound("Saved job not found");

        context.SavedJobs.Remove(saved);
        await context.SaveChangesAsync(ct);

        return Result<bool>.Success(true);
    }
}

