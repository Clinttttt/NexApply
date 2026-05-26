using FluentValidation;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.DeleteJobListing;

public class DeleteJobListingValidator : AbstractValidator<DeleteJobListingCommand>
{
    public DeleteJobListingValidator()
    {
        RuleFor(x => x.JobListingId).NotEmpty();
    }
}

