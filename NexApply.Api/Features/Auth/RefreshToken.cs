using MediatR;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Auth;

public static class RefreshToken
{
    public sealed record Command(string RefreshToken) : IRequest<Result<TokenResponse>>;

    internal sealed class Handler(TokenService tokenService) : IRequestHandler<Command, Result<TokenResponse>>
    {
        public async Task<Result<TokenResponse>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await tokenService.ValidateRefreshToken(request.RefreshToken, cancellationToken);

            if (user is null)
            {
                return Result<TokenResponse>.Unauthorized("Invalid token");
            }

            return Result<TokenResponse>.Success(await tokenService.CreateTokenResponse(user));
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/refresh", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(RefreshToken));
}
