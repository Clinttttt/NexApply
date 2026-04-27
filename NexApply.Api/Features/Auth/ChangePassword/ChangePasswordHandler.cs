using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Contracts.Auth;
using NexApply.Contracts.Common;

namespace NexApply.Api.Features.Auth.ChangePassword;

public class ChangePasswordHandler(AppDbContext context, CurrentUser currentUser) : IRequestHandler<ChangePasswordCommand, Result<string>>
{
    public async Task<Result<string>> Handle(ChangePasswordCommand request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);

        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null)
            return Result<string>.NotFound("User not found");

        var passwordHasher = new PasswordHasher<User>();
        var verifyResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);

        if (verifyResult == PasswordVerificationResult.Failed)
            return Result<string>.Unauthorized("Current password is incorrect");

        var newPasswordHash = passwordHasher.HashPassword(user, request.NewPassword);
        user.ChangePassword(newPasswordHash);

        await context.SaveChangesAsync(ct);

        return Result<string>.Success("Password changed successfully");
    }
}
