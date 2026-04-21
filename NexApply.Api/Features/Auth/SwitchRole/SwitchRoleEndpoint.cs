using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Contracts.Auth;
using NexApply.Api.Common;

namespace NexApply.Api.Features.Auth.SwitchRole;

public static class SwitchRoleEndpoint
{
    public static IEndpointRouteBuilder MapSwitchRoleEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/switch-role", [Authorize] async (SwitchRoleCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Auth")
        .WithName("SwitchRole")
        .WithOpenApi();

        return app;
    }
}
