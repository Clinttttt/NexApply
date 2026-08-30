using FluentValidation;
using Google.Apis.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Extensions;
using CompanyProfileEntity = NexApply.Api.Domain.CompanyProfile;

namespace NexApply.Api.Features.Auth;

public static class LoginWithGoogle
{
    public sealed record Command(string IdToken, UserRole? Role = null) : IRequest<Result<TokenResponse>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.IdToken)
                .NotEmpty()
                .WithMessage("Google ID token is required.");
        }
    }

    internal sealed class Handler(IConfiguration configuration, AppDbContext context, TokenService tokenService)
        : IRequestHandler<Command, Result<TokenResponse>>
    {
        public async Task<Result<TokenResponse>> Handle(Command request, CancellationToken cancellationToken)
        {
            var googleClientId = configuration["Authentication:Google:ClientId"];
            if (string.IsNullOrWhiteSpace(googleClientId))
            {
                return Result<TokenResponse>.Failure("Google login is not configured");
            }

            GoogleJsonWebSignature.Payload payload;

            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(
                    request.IdToken,
                    new GoogleJsonWebSignature.ValidationSettings { Audience = [googleClientId] });
            }
            catch (InvalidJwtException)
            {
                return Result<TokenResponse>.Failure("Invalid Google token");
            }

            if (!payload.EmailVerified || string.IsNullOrWhiteSpace(payload.Email))
            {
                return Result<TokenResponse>.Failure("Google email is not verified");
            }

            var user = await context.Users
                .FirstOrDefaultAsync(candidate => candidate.Email == payload.Email, cancellationToken);

            if (user is null)
            {
                user = await CreateUserAsync(payload, request.Role ?? UserRole.Student, cancellationToken);
            }

            return Result<TokenResponse>.Success(await tokenService.CreateTokenResponse(user));
        }

        private async Task<User> CreateUserAsync(
            GoogleJsonWebSignature.Payload payload,
            UserRole role,
            CancellationToken cancellationToken)
        {
            await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);

            var username = await GenerateUniqueUsernameAsync(payload.Email.Split('@')[0], cancellationToken);
            var fullName = string.IsNullOrWhiteSpace(payload.Name) ? username : payload.Name;

            var user = role == UserRole.Company
                ? User.CreateCompany(payload.Email, username, string.Empty)
                : User.CreateStudent(payload.Email, username, string.Empty);

            await context.Users.AddAsync(user, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);

            if (role == UserRole.Company)
            {
                await context.CompanyProfiles.AddAsync(
                    CompanyProfileEntity.Create(user.Id, fullName),
                    cancellationToken);
            }
            else
            {
                await context.StudentProfiles.AddAsync(
                    StudentProfile.Create(user.Id, fullName),
                    cancellationToken);
            }

            await context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return user;
        }

        private async Task<string> GenerateUniqueUsernameAsync(string baseUsername, CancellationToken cancellationToken)
        {
            var username = baseUsername;
            var suffix = 1;

            while (await context.Users.AnyAsync(candidate => candidate.Username == username, cancellationToken))
            {
                username = $"{baseUsername}{suffix}";
                suffix++;
            }

            return username;
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/login-google", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(LoginWithGoogle));
}
