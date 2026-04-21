using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NexApply.Contracts.Common;
using NexApply.Contracts.Auth;
using NexApply.Api.Data;
using NexApply.Api.Entities;

namespace NexApply.Api.Features.Auth.Login
{
    public class LoginHandler(TokenService tokenService, AppDbContext context) : IRequestHandler<LoginCommand, Result<TokenResponseDto>>
    {
        public async Task<Result<TokenResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Username == request.Username, cancellationToken);
            if (user is null) return Result<TokenResponseDto>.Unauthorized();
            if (new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash!, request.Password) == PasswordVerificationResult.Failed)
            {
                return Result<TokenResponseDto>.Unauthorized();
            }
            return Result<TokenResponseDto>.Success(await tokenService.CreateTokenResponse(user));
        }
    }
}
