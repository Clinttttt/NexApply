using FluentValidation;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.GetJobListingDetails;

public class GetJobListingDetailsValidator : AbstractValidator<GetJobListingDetailsQuery>
{
    public GetJobListingDetailsValidator()
    {
        RuleFor(x => x.JobListingId)
            .NotEmpty().WithMessage("Job listing ID is required.");
    }
}
