using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Services;
using NexApply.Contracts.Auth;
using NexApply.Contracts.Common;

namespace NexApply.Api.Features.Auth.VerifyEmail;

public class VerifyEmailHandler(AppDbContext context, TokenService tokenService) : IRequestHandler<VerifyEmailCommand, Result<TokenResponseDto>>
{
    public async Task<Result<TokenResponseDto>> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (user is null)
            return Result<TokenResponseDto>.NotFound("Email not found.");

        if (user.IsEmailVerified)
            return Result<TokenResponseDto>.Conflict("Email is already verified.");

        if (string.IsNullOrEmpty(user.EmailVerificationCode))
            return Result<TokenResponseDto>.Failure("No verification code found. Please request a new code.");

        if (user.EmailVerificationCodeExpiry < DateTime.UtcNow)
            return Result<TokenResponseDto>.Failure("Verification code has expired. Please request a new code.");

        if (user.EmailVerificationCode != request.Code)
            return Result<TokenResponseDto>.Failure("Invalid verification code.");

        user.VerifyEmail();
        await context.SaveChangesAsync(cancellationToken);

        var tokenResponse = await tokenService.CreateTokenResponse(user);
        return Result<TokenResponseDto>.Success(tokenResponse);
    }
}
