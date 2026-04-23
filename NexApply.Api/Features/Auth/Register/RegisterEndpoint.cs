using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Auth;
using NexApply.Contracts.Common;

namespace NexApply.Api.Features.Auth.Register;

public static class RegisterEndpoint
{
    public static void MapRegisterEndpoint(this WebApplication app)
    {
        app.MapPost("/api/auth/register", async (RegisterCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Auth")
        .WithName("Register")
        .Produces<TokenResponseDto>(200)
        .Produces(400)
        .Produces(409);
    }
}
