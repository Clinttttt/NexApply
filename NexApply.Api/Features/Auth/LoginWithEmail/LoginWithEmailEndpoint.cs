using MediatR;
using NexApply.Api.Common;
using NexApply.Api.Features.Auth.Login;

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
