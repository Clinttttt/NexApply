using FluentValidation;
using NexApply.Contracts.Auth;

namespace NexApply.Api.Features.Auth.SendVerificationCode;

public class SendVerificationCodeValidator : AbstractValidator<SendVerificationCodeCommand>
{
    public SendVerificationCodeValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required.")
            .EmailAddress()
            .WithMessage("Invalid email format.");
    }
}
