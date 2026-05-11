using FluentValidation;
using NexApply.Contracts.Applications;

namespace NexApply.Api.Features.Applications.Apply;

public class ApplyValidator : AbstractValidator<ApplyCommand>
{
    public ApplyValidator()
    {
        RuleFor(command => command.JobListingId)
            .NotEmpty();

        RuleFor(command => command.CoverLetter)
            .MaximumLength(4000)
            .When(command => !string.IsNullOrWhiteSpace(command.CoverLetter));

        RuleFor(command => command.ResumeUrl)
            .MaximumLength(1000)
            .When(command => !string.IsNullOrWhiteSpace(command.ResumeUrl));
    }
}
