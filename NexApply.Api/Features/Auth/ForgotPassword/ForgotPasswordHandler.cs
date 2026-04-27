using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Services;
using NexApply.Contracts.Auth;
using NexApply.Contracts.Common;

namespace NexApply.Api.Features.Auth.ForgotPassword;

public class ForgotPasswordHandler(AppDbContext context, IEmailService emailService) : IRequestHandler<ForgotPasswordCommand, Result<string>>
{
    public async Task<Result<string>> Handle(ForgotPasswordCommand request, CancellationToken ct)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email, ct);
        if (user is null)
            return Result<string>.NotFound("Email not found");

        var resetCode = GenerateResetCode();
        var expiry = DateTime.UtcNow.AddMinutes(15);

        user.SetPasswordResetCode(resetCode, expiry);
        await context.SaveChangesAsync(ct);

        _ = emailService.SendPasswordResetCodeAsync(request.Email, resetCode);

        return Result<string>.Success("Password reset code sent to your email");
    }

    private static string GenerateResetCode()
    {
        return Random.Shared.Next(100000, 999999).ToString();
    }
}
