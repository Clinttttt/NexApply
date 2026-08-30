using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Auth;

public static class VerifyEmail
{
    public sealed record Command(string Email, string Code) : IRequest<Result<TokenResponse>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.Email)
                .NotEmpty()
                .WithMessage("Email is required.")
                .EmailAddress()
                .WithMessage("Invalid email format.");

            RuleFor(command => command.Code)
                .NotEmpty()
                .WithMessage("Verification code is required.")
                .Length(6)
                .WithMessage("Verification code must be 6 digits.")
                .Matches("^[0-9]+$")
                .WithMessage("Verification code must contain only numbers.");
        }
    }

    internal sealed class Handler(AppDbContext context, TokenService tokenService)
        : IRequestHandler<Command, Result<TokenResponse>>
    {
        public async Task<Result<TokenResponse>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(candidate => candidate.Email == request.Email, cancellationToken);

            if (user is null)
            {
                return Result<TokenResponse>.NotFound("Email not found.");
            }

            if (user.IsEmailVerified)
            {
                return Result<TokenResponse>.Conflict("Email is already verified.");
            }

            if (string.IsNullOrEmpty(user.EmailVerificationCode))
            {
                return Result<TokenResponse>.Failure("No verification code found. Please request a new code.");
            }

            if (user.EmailVerificationCodeExpiry < DateTime.UtcNow)
            {
                return Result<TokenResponse>.Failure("Verification code has expired. Please request a new code.");
            }

            if (user.EmailVerificationCode != request.Code)
            {
                return Result<TokenResponse>.Failure("Invalid verification code.");
            }

            user.VerifyEmail();
            await context.SaveChangesAsync(cancellationToken);

            return Result<TokenResponse>.Success(await tokenService.CreateTokenResponse(user));
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/verify-email", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(VerifyEmail))
            .Produces<TokenResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status409Conflict);
}
