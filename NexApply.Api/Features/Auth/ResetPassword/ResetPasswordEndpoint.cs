using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Auth;

namespace NexApply.Api.Features.Auth.ResetPassword;

public static class ResetPasswordEndpoint
{
    public static IEndpointRouteBuilder MapResetPassword(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/reset-password", async (ResetPasswordCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.ToIResult();
        })
        .AllowAnonymous()
        .WithTags("Auth");

        return app;
    }
}
