using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.SavedJobs;

namespace NexApply.Api.Features.SavedJobs.GetSavedJobs;

public static class GetSavedJobsEndpoint
{
    public static void MapGetSavedJobs(this WebApplication app)
    {
        app.MapGet("/api/saved-jobs", [Authorize(Roles = "Student")] async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetSavedJobsQuery());
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Student");
    }
}

