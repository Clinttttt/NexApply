using MediatR;
using NexApply.Contracts.Auth;
using NexApply.Api.Common;

namespace NexApply.Api.Features.Auth.LoginWithEmail
{
    public static class LoginWithEmailEndpoint
    {
        public static void MapLoginWithEmail(this WebApplication app)
        {
            app.MapPost("/api/auth/login-google", async (LoginWithEmailCommand request, ISender mediator) =>
            {
                var result = await mediator.Send(request);
                return ResultExtensions.ToIResult(result);
            });
        }
    }
}
