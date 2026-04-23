using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Auth;
using NexApply.Contracts.Common;

namespace NexApply.Api.Features.Auth.SendVerificationCode;

public static class SendVerificationCodeEndpoint
{
    public static void MapSendVerificationCodeEndpoint(this WebApplication app)
    {
        app.MapPost("/api/auth/send-verification-code", async (SendVerificationCodeCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Auth")
        .WithName("SendVerificationCode")
        .Produces<string>(200)
        .Produces(400)
        .Produces(404)
        .Produces(409);
    }
}
