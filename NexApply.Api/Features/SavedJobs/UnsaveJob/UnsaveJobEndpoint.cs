using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.SavedJobs;

namespace NexApply.Api.Features.SavedJobs.UnsaveJob;

public static class UnsaveJobEndpoint
{
    public static void MapUnsaveJob(this WebApplication app)
    {
        app.MapDelete("/api/saved-jobs/{jobListingId:guid}", [Authorize(Roles = "Student")] async (Guid jobListingId, IMediator mediator) =>
        {
            var result = await mediator.Send(new UnsaveJobCommand(jobListingId));
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Student");
    }
}

