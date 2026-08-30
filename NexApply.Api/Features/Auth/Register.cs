using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Extensions;
using CompanyProfileEntity = NexApply.Api.Domain.CompanyProfile;

namespace NexApply.Api.Features.Auth;

public static class Register
{
    public sealed record Command(
        string FullName,
        string Username,
        string Email,
        string Password,
        string ConfirmPassword,
        UserRole Role) : IRequest<Result<TokenResponse>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.FullName)
                .NotEmpty()
                .WithMessage("Full name is required.")
                .MaximumLength(100)
                .WithMessage("Full name cannot exceed 100 characters.");

            RuleFor(command => command.Username)
                .NotEmpty()
                .WithMessage("Username is required.")
                .MinimumLength(3)
                .WithMessage("Username must be at least 3 characters.")
                .MaximumLength(50)
                .WithMessage("Username cannot exceed 50 characters.")
                .Matches("^[a-zA-Z0-9_]+$")
                .WithMessage("Username can only contain letters, numbers, and underscores.");

            RuleFor(command => command.Email)
                .NotEmpty()
                .WithMessage("Email is required.")
                .EmailAddress()
                .WithMessage("Invalid email format.")
                .Matches(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
                .WithMessage("Email must be a valid format.");

            RuleFor(command => command.Password)
                .NotEmpty()
                .WithMessage("Password is required.")
                .MinimumLength(8)
                .WithMessage("Password must be at least 8 characters.");

            RuleFor(command => command.ConfirmPassword)
                .NotEmpty()
                .WithMessage("Confirm password is required.")
                .Equal(command => command.Password)
                .WithMessage("Passwords do not match.");

            RuleFor(command => command.Role)
                .IsInEnum()
                .WithMessage("Invalid role selected.");
        }
    }

    internal sealed class Handler(AppDbContext context, IEmailService emailService)
        : IRequestHandler<Command, Result<TokenResponse>>
    {
        public async Task<Result<TokenResponse>> Handle(Command request, CancellationToken cancellationToken)
        {
            if (await context.Users.AnyAsync(user => user.Email == request.Email, cancellationToken))
            {
                return Result<TokenResponse>.Conflict("Email is already registered.");
            }

            if (await context.Users.AnyAsync(user => user.Username == request.Username, cancellationToken))
            {
                return Result<TokenResponse>.Conflict("Username is already taken.");
            }

            var passwordHash = new PasswordHasher<User>().HashPassword(null!, request.Password);

            var user = request.Role == UserRole.Student
                ? User.CreateStudent(request.Email, request.Username, passwordHash)
                : User.CreateCompany(request.Email, request.Username, passwordHash);

            var verificationCode = VerificationCode.Generate();
            user.SetEmailVerificationCode(verificationCode, DateTime.UtcNow.AddMinutes(10));

            context.Users.Add(user);
            await context.SaveChangesAsync(cancellationToken);

            if (request.Role == UserRole.Student)
            {
                context.StudentProfiles.Add(StudentProfile.Create(user.Id, request.FullName));
            }
            else
            {
                context.CompanyProfiles.Add(CompanyProfileEntity.Create(user.Id, request.FullName));
            }

            await context.SaveChangesAsync(cancellationToken);

            _ = emailService.SendVerificationCodeAsync(request.Email, verificationCode);

            return Result<TokenResponse>.Success(new TokenResponse());
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/register", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(Register))
            .Produces<TokenResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status409Conflict);
}
