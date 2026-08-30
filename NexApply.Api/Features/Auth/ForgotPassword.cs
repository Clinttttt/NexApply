using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Auth;

public static class ForgotPassword
{
    public sealed record Command(string Email) : IRequest<Result<string>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.Email)
                .NotEmpty()
                .WithMessage("Email is required")
                .EmailAddress()
                .WithMessage("Invalid email address");
        }
    }

    internal sealed class Handler(AppDbContext context, IEmailService emailService)
        : IRequestHandler<Command, Result<string>>
    {
        public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(candidate => candidate.Email == request.Email, cancellationToken);

            if (user is null)
            {
                return Result<string>.NotFound("Email not found");
            }

            var resetCode = VerificationCode.Generate();
            user.SetPasswordResetCode(resetCode, DateTime.UtcNow.AddMinutes(15));
            await context.SaveChangesAsync(cancellationToken);

            _ = emailService.SendPasswordResetCodeAsync(request.Email, resetCode);

            return Result<string>.Success("Password reset code sent to your email");
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/forgot-password", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .AllowAnonymous()
            .WithName(nameof(ForgotPassword));
}
