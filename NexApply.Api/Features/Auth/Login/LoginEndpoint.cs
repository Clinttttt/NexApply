using MediatR;
using NexApply.Contracts.Auth;
using NexApply.Api.Common;

namespace NexApply.Api.Features.Auth.Login
{
    public static class LoginEndpoint
    {
        public static void MapLoginEndpoint(this WebApplication app)
        {
            app.MapPost("/api/auth/login", async (LoginCommand request, ISender mediator) =>
            {
                var result = await mediator.Send(request);
                return ResultExtensions.ToIResult(result);
            })
            .Accepts<LoginCommand>("application/json")
            .Produces<TokenResponseDto>(200)
            .Produces(401)
            .WithTags("Auth");
        }
    }
}
