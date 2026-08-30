using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Auth;

public static class Login
{
    public sealed record Command(string Email, string Password) : IRequest<Result<TokenResponse>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.Email)
                .NotEmpty()
                .WithMessage("Email is required.")
                .EmailAddress()
                .WithMessage("Invalid email format.");

            RuleFor(command => command.Password)
                .NotEmpty()
                .WithMessage("Password is required.");
        }
    }

    internal sealed class Handler(TokenService tokenService, AppDbContext context)
        : IRequestHandler<Command, Result<TokenResponse>>
    {
        public async Task<Result<TokenResponse>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(candidate => candidate.Email == request.Email, cancellationToken);

            if (user is null)
            {
                return Result<TokenResponse>.Unauthorized("User not found");
            }

            var verification = new PasswordHasher<User>()
                .VerifyHashedPassword(user, user.PasswordHash, request.Password);

            if (verification == PasswordVerificationResult.Failed)
            {
                return Result<TokenResponse>.Unauthorized("Invalid Password");
            }

            return Result<TokenResponse>.Success(await tokenService.CreateTokenResponse(user));
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/login", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(Login))
            .Accepts<Command>("application/json")
            .Produces<TokenResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);
}
