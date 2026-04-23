using MediatR;
using NexApply.Contracts.Common;
using NexApply.Contracts.Auth;

namespace NexApply.Api.Features.Auth.Refresh
{
    public class RefreshTokenCommandHandler(TokenService tokenService) : IRequestHandler<RefreshTokenCommand, Result<TokenResponseDto>>
    {
        public async Task<Result<TokenResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            var user = await tokenService.ValidateRefreshToken(request.RefreshToken, cancellationToken);
            if (user is null) return Result<TokenResponseDto>.Unauthorized("Invalid token");
            return Result<TokenResponseDto>.Success( await tokenService.CreateTokenResponse(user));
        }
    }
}
