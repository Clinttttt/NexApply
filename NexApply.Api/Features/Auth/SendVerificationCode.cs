using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Auth;

public static class SendVerificationCode
{
    public sealed record Command(string Email) : IRequest<Result<string>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.Email)
                .NotEmpty()
                .WithMessage("Email is required.")
                .EmailAddress()
                .WithMessage("Invalid email format.");
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
                return Result<string>.NotFound("Email not found.");
            }

            if (user.IsEmailVerified)
            {
                return Result<string>.Conflict("Email is already verified.");
            }

            var code = VerificationCode.Generate();
            user.SetEmailVerificationCode(code, DateTime.UtcNow.AddMinutes(10));
            await context.SaveChangesAsync(cancellationToken);

            _ = emailService.SendVerificationCodeAsync(request.Email, code);

            return Result<string>.Success("Verification code sent to your email.");
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/send-verification-code", async (
                Command command,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(SendVerificationCode))
            .Produces<string>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status409Conflict);
}
