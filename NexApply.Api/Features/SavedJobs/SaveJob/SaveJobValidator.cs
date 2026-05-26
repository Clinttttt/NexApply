using FluentValidation;
using NexApply.Contracts.SavedJobs;

namespace NexApply.Api.Features.SavedJobs.SaveJob;

public class SaveJobValidator : AbstractValidator<SaveJobCommand>
{
    public SaveJobValidator()
    {
        RuleFor(x => x.JobListingId)
            .NotEmpty();
    }
}

