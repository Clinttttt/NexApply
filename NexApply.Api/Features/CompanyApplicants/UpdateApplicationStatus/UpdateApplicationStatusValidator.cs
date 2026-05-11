using FluentValidation;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.CompanyApplicants;

namespace NexApply.Api.Features.CompanyApplicants.UpdateApplicationStatus;

public class UpdateApplicationStatusValidator : AbstractValidator<UpdateApplicationStatusCommand>
{
    public UpdateApplicationStatusValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty();

        RuleFor(x => x.Status)
            .NotEmpty()
            .Must(status => Enum.TryParse<ApplicationStatus>(status, ignoreCase: true, out _))
            .WithMessage("Status must be one of: Submitted, UnderReview, Shortlisted, ForInterview, Declined");
    }
}
