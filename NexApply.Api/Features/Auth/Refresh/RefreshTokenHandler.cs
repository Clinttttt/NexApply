using MediatR;
using NexApply.Api.Common;

namespace NexApply.Api.Features.Auth.Refresh
{
    public class RefreshTokenCommand() : IRequest<Result<TokenResponseDto>>
    {
        public string RefreshToken { get; set; } = string.Empty;    
    }
    public class RefreshTokenCommandHandler(TokenService tokenService) : IRequestHandler<RefreshTokenCommand, Result<TokenResponseDto>>
    {
        public async Task<Result<TokenResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            var user = await tokenService.ValidateRefreshToken(request.RefreshToken, cancellationToken);
            if (user is null) return Result<TokenResponseDto>.Unauthorized();
            return Result<TokenResponseDto>.Success( await tokenService.CreateTokenResponse(user));
        }
    }
}
