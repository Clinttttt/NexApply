using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Auth;

namespace NexApply.Api.Features.Auth.ChangePassword;

public static class ChangePasswordEndpoint
{
    public static IEndpointRouteBuilder MapChangePassword(this IEndpointRouteBuilder app)
    {
        app.MapPut("/api/auth/change-password", async (ChangePasswordCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.ToIResult();
        })
        .RequireAuthorization()
        .WithTags("Auth");

        return app;
    }
}
