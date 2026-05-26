using FluentValidation;
using NexApply.Contracts.SavedJobs;

namespace NexApply.Api.Features.SavedJobs.UnsaveJob;

public class UnsaveJobValidator : AbstractValidator<UnsaveJobCommand>
{
    public UnsaveJobValidator()
    {
        RuleFor(x => x.JobListingId)
            .NotEmpty();
    }
}

