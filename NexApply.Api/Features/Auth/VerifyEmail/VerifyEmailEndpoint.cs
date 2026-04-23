using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Auth;
using NexApply.Contracts.Common;

namespace NexApply.Api.Features.Auth.VerifyEmail;

public static class VerifyEmailEndpoint
{
    public static void MapVerifyEmailEndpoint(this WebApplication app)
    {
        app.MapPost("/api/auth/verify-email", async (VerifyEmailCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Auth")
        .WithName("VerifyEmail")
        .Produces<TokenResponseDto>(200)
        .Produces(400)
        .Produces(404)
        .Produces(409);
    }
}
