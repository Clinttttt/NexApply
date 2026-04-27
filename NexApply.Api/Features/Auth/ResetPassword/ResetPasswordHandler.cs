using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Contracts.Auth;
using NexApply.Contracts.Common;

namespace NexApply.Api.Features.Auth.ResetPassword;

public class ResetPasswordHandler(AppDbContext context) : IRequestHandler<ResetPasswordCommand, Result<string>>
{
    public async Task<Result<string>> Handle(ResetPasswordCommand request, CancellationToken ct)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email, ct);
        if (user is null)
            return Result<string>.NotFound("Email not found");

        if (string.IsNullOrEmpty(user.PasswordResetCode))
            return Result<string>.Failure("No password reset request found. Please request a new reset code");

        if (user.PasswordResetCodeExpiry < DateTime.UtcNow)
            return Result<string>.Failure("Reset code has expired. Please request a new one");

        if (user.PasswordResetCode != request.ResetCode)
            return Result<string>.Failure("Invalid reset code");

        var passwordHasher = new PasswordHasher<User>();
        var newPasswordHash = passwordHasher.HashPassword(user, request.NewPassword);

        user.ResetPassword(newPasswordHash);
        await context.SaveChangesAsync(ct);

        return Result<string>.Success("Password reset successfully. You can now login with your new password");
    }
}
