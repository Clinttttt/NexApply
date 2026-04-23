using FluentValidation;
using NexApply.Contracts.Auth;

namespace NexApply.Api.Features.Auth.VerifyEmail;

public class VerifyEmailValidator : AbstractValidator<VerifyEmailCommand>
{
    public VerifyEmailValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required.")
            .EmailAddress()
            .WithMessage("Invalid email format.");

        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Verification code is required.")
            .Length(6)
            .WithMessage("Verification code must be 6 digits.")
            .Matches("^[0-9]+$")
            .WithMessage("Verification code must contain only numbers.");
    }
}
