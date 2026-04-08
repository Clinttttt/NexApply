using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using Npgsql.EntityFrameworkCore.PostgreSQL.Infrastructure.Internal;

namespace NexApply.Api.Features.Auth.Login
{
    public record LoginCommand(string username, string password) : IRequest<Result<TokenResponseDto>>;

    public class LoginHandler(TokenService tokenService, AppDbContext context) : IRequestHandler<LoginCommand, Result<TokenResponseDto>>
    {
        public async Task<Result<TokenResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Username == request.username, cancellationToken);
            if (user is null) return Result<TokenResponseDto>.Unauthorized();
            if (new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash!, request.password) == PasswordVerificationResult.Failed)
            {
                return Result<TokenResponseDto>.Unauthorized();
            }
            return Result<TokenResponseDto>.Success(await tokenService.CreateTokenResponse(user));
        }

    }
}
