using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.SavedJobs;

namespace NexApply.Api.Features.SavedJobs.SaveJob;

public static class SaveJobEndpoint
{
    public static void MapSaveJob(this WebApplication app)
    {
        app.MapPost("/api/saved-jobs", [Authorize(Roles = "Student")] async (SaveJobCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Student");
    }
}

