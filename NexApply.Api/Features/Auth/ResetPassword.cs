using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Auth;

public static class ResetPassword
{
    public sealed record Command(
        string Email,
        string ResetCode,
        string NewPassword,
        string ConfirmPassword) : IRequest<Result<string>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.Email)
                .NotEmpty()
                .WithMessage("Email is required")
                .EmailAddress()
                .WithMessage("Invalid email address");

            RuleFor(command => command.ResetCode)
                .NotEmpty()
                .WithMessage("Reset code is required")
                .Length(6)
                .WithMessage("Reset code must be 6 digits");

            RuleFor(command => command.NewPassword)
                .NotEmpty()
                .WithMessage("New password is required")
                .MinimumLength(6)
                .WithMessage("Password must be at least 6 characters");

            RuleFor(command => command.ConfirmPassword)
                .NotEmpty()
                .WithMessage("Confirm password is required")
                .Equal(command => command.NewPassword)
                .WithMessage("Passwords do not match");
        }
    }

    internal sealed class Handler(AppDbContext context) : IRequestHandler<Command, Result<string>>
    {
        public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(candidate => candidate.Email == request.Email, cancellationToken);

            if (user is null)
            {
                return Result<string>.NotFound("Email not found");
            }

            if (string.IsNullOrEmpty(user.PasswordResetCode))
            {
                return Result<string>.Failure("No password reset request found. Please request a new reset code");
            }

            if (user.PasswordResetCodeExpiry < DateTime.UtcNow)
            {
                return Result<string>.Failure("Reset code has expired. Please request a new one");
            }

            if (user.PasswordResetCode != request.ResetCode)
            {
                return Result<string>.Failure("Invalid reset code");
            }

            user.ResetPassword(new PasswordHasher<User>().HashPassword(user, request.NewPassword));
            await context.SaveChangesAsync(cancellationToken);

            return Result<string>.Success("Password reset successfully. You can now login with your new password");
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/reset-password", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .AllowAnonymous()
            .WithName(nameof(ResetPassword));
}
