using FluentValidation;
using NexApply.Contracts.Auth;

namespace NexApply.Api.Features.Auth.LoginWithEmail;

public class LoginWithEmailValidator : AbstractValidator<LoginWithEmailCommand>
{
    public LoginWithEmailValidator()
    {
        RuleFor(x => x.IdToken)
            .NotEmpty()
            .WithMessage("Google ID token is required.");
    }
}
