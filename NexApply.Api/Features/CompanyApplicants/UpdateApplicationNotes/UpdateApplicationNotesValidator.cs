using FluentValidation;
using NexApply.Contracts.CompanyApplicants;

namespace NexApply.Api.Features.CompanyApplicants.UpdateApplicationNotes;

public class UpdateApplicationNotesValidator : AbstractValidator<UpdateApplicationNotesCommand>
{
    public UpdateApplicationNotesValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty();

        RuleFor(x => x.RecruiterNotes)
            .MaximumLength(2000);
    }
}
