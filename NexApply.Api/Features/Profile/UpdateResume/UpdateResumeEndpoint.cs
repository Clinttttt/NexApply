using MediatR;
using Microsoft.AspNetCore.Mvc;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.Profile.Commands;

namespace NexApply.Api.Features.Profile.UpdateResume;

public static class UpdateResumeEndpoint
{
    public static IEndpointRouteBuilder MapUpdateResumeEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPut("/api/profile/resume", async ([FromBody] UpdateResumeCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return ResultExtensions.ToIResult(result);
        })
        .RequireAuthorization()
        .WithTags("Profile");

        return app;
    }
}
