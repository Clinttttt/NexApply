using FluentValidation;

namespace NexApply.Api.Features.Auth.Login;

public class LoginValidator : AbstractValidator<LoginCommand>
{
    public LoginValidator()
    {
        RuleFor(x => x.username)
            .NotEmpty()
            .WithMessage("Username is required.");

        RuleFor(x => x.password)
            .NotEmpty()
            .WithMessage("Password is required.");
    }
}
