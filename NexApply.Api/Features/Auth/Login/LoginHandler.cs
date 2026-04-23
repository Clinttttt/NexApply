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
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
            if (user is null) return Result<TokenResponseDto>.Unauthorized("User not found");
            
            if (new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash!, request.Password) == PasswordVerificationResult.Failed)
            {
                return Result<TokenResponseDto>.Unauthorized("Invalid Password");
            }

            if (!user.IsEmailVerified)
            {
                return Result<TokenResponseDto>.Unauthorized("Email not verified. Please verify your email before logging in.");
            }

            return Result<TokenResponseDto>.Success(await tokenService.CreateTokenResponse(user));
        }
    }
}
