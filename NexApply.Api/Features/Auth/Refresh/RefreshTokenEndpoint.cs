using MediatR;
using NexApply.Api.Common;

namespace NexApply.Api.Features.Auth.Refresh
{
    public static class RefreshTokenEndpoint
    {
        public static void MapRefreshToken(this WebApplication app)
        {
            app.MapPost("/api/auth/refresh", async (RefreshTokenCommand command, ISender mediator) =>
            {
                var result = await mediator.Send(command);
                return ResultExtensions.ToIResult(result);
            });
        }
    }
}
