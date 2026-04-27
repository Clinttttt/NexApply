using FluentValidation;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.UpdateJobListingStatus;

public class UpdateJobListingStatusValidator : AbstractValidator<UpdateJobListingStatusCommand>
{
    public UpdateJobListingStatusValidator()
    {
        RuleFor(x => x.JobListingId)
            .NotEmpty().WithMessage("Job listing ID is required.");

        RuleFor(x => x.Status)
            .Must(x => Enum.IsDefined(typeof(JobListingStatus), x))
            .WithMessage("Invalid status value.");
    }
}
