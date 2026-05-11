using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.Applications;

namespace NexApply.Api.Features.Applications.Apply;

public static class ApplyEndpoint
{
    public static void MapApply(this WebApplication app)
    {
        app.MapPost("/api/applications", [Authorize(Roles = "Student")] async (ApplyCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Applications");
    }
}
