using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Auth;

namespace NexApply.Api.Features.Auth.ForgotPassword;

public static class ForgotPasswordEndpoint
{
    public static IEndpointRouteBuilder MapForgotPassword(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/forgot-password", async (ForgotPasswordCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.ToIResult();
        })
        .AllowAnonymous()
        .WithTags("Auth");

        return app;
    }
}
