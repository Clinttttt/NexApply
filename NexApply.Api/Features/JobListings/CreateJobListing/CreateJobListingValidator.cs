using FluentValidation;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.CreateJobListing;

public class CreateJobListingValidator : AbstractValidator<CreateJobListingCommand>
{
    public CreateJobListingValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Job title is required")
            .MaximumLength(300).WithMessage("Job title cannot exceed 300 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Job description is required");

        RuleFor(x => x.Responsibilities)
            .NotEmpty().WithMessage("Responsibilities are required");

        RuleFor(x => x.Qualifications)
            .NotEmpty().WithMessage("Qualifications are required");

        RuleFor(x => x.RequiredSkills)
            .NotEmpty().WithMessage("Required skills are required");

        RuleFor(x => x.Location)
            .NotEmpty().WithMessage("Location is required")
            .MaximumLength(200).WithMessage("Location cannot exceed 200 characters");

        RuleFor(x => x.JobType)
            .InclusiveBetween(0, 4).WithMessage("Invalid job type");

        RuleFor(x => x.WorkSetup)
            .InclusiveBetween(0, 2).WithMessage("Invalid work setup");

        RuleFor(x => x.SalaryMin)
            .GreaterThanOrEqualTo(0).When(x => x.SalaryMin.HasValue)
            .WithMessage("Minimum salary must be greater than or equal to 0");

        RuleFor(x => x.SalaryMax)
            .GreaterThanOrEqualTo(x => x.SalaryMin ?? 0).When(x => x.SalaryMax.HasValue && x.SalaryMin.HasValue)
            .WithMessage("Maximum salary must be greater than or equal to minimum salary");

        RuleFor(x => x.Openings)
            .GreaterThan(0).WithMessage("Number of openings must be greater than 0");

        RuleFor(x => x.Deadline)
            .GreaterThan(DateTime.UtcNow).When(x => x.Deadline.HasValue)
            .WithMessage("Deadline must be in the future");
    }
}
