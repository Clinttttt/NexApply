using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Auth;

public static class ChangePassword
{
    public sealed record Command(
        string CurrentPassword,
        string NewPassword,
        string ConfirmPassword) : IRequest<Result<string>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.CurrentPassword)
                .NotEmpty()
                .WithMessage("Current password is required");

            RuleFor(command => command.NewPassword)
                .NotEmpty()
                .WithMessage("New password is required")
                .MinimumLength(6)
                .WithMessage("Password must be at least 6 characters")
                .NotEqual(command => command.CurrentPassword)
                .WithMessage("New password must be different from current password");

            RuleFor(command => command.ConfirmPassword)
                .NotEmpty()
                .WithMessage("Confirm password is required")
                .Equal(command => command.NewPassword)
                .WithMessage("Passwords do not match");
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Command, Result<string>>
    {
        public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var user = await context.Users
                .FirstOrDefaultAsync(candidate => candidate.Id == userId, cancellationToken);

            if (user is null)
            {
                return Result<string>.NotFound("User not found");
            }

            var passwordHasher = new PasswordHasher<User>();
            var verification = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);

            if (verification == PasswordVerificationResult.Failed)
            {
                return Result<string>.Unauthorized("Current password is incorrect");
            }

            user.ChangePassword(passwordHasher.HashPassword(user, request.NewPassword));
            await context.SaveChangesAsync(cancellationToken);

            return Result<string>.Success("Password changed successfully");
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPut("/change-password", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .RequireAuthorization()
            .WithName(nameof(ChangePassword));
}
