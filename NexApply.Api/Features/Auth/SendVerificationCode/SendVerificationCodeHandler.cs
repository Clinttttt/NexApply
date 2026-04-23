using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Services;
using NexApply.Contracts.Auth;
using NexApply.Contracts.Common;

namespace NexApply.Api.Features.Auth.SendVerificationCode;

public class SendVerificationCodeHandler(AppDbContext context, IEmailService emailService) : IRequestHandler<SendVerificationCodeCommand, Result<string>>
{
    public async Task<Result<string>> Handle(SendVerificationCodeCommand request, CancellationToken cancellationToken)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (user is null)
            return Result<string>.NotFound("Email not found.");

        if (user.IsEmailVerified)
            return Result<string>.Conflict("Email is already verified.");

        var code = GenerateVerificationCode();
        var expiry = DateTime.UtcNow.AddMinutes(10);

        user.SetEmailVerificationCode(code, expiry);
        await context.SaveChangesAsync(cancellationToken);

        _ = emailService.SendVerificationCodeAsync(request.Email, code);

        return Result<string>.Success("Verification code sent to your email.");
    }

    private static string GenerateVerificationCode()
    {
        return Random.Shared.Next(100000, 999999).ToString();
    }
}
