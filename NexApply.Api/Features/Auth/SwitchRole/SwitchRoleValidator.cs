using FluentValidation;
using NexApply.Api.Entities.Enums;

namespace NexApply.Api.Features.Auth.SwitchRole;

public class SwitchRoleValidator : AbstractValidator<SwitchRoleCommand>
{
    public SwitchRoleValidator()
    {
        RuleFor(x => x.NewRole)
            .IsInEnum()
            .WithMessage("Invalid role. Must be Student or Company.");
    }
}
