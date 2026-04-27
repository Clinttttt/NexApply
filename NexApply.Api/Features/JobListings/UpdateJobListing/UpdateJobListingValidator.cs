using FluentValidation;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.UpdateJobListing;

public class UpdateJobListingValidator : AbstractValidator<UpdateJobListingCommand>
{
    public UpdateJobListingValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Job listing ID is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters.");

        RuleFor(x => x.Responsibilities)
            .NotEmpty().WithMessage("Responsibilities are required.")
            .MaximumLength(2000).WithMessage("Responsibilities cannot exceed 2000 characters.");

        RuleFor(x => x.Qualifications)
            .NotEmpty().WithMessage("Qualifications are required.")
            .MaximumLength(2000).WithMessage("Qualifications cannot exceed 2000 characters.");

        RuleFor(x => x.RequiredSkills)
            .NotEmpty().WithMessage("Required skills are required.")
            .MaximumLength(500).WithMessage("Required skills cannot exceed 500 characters.");

        RuleFor(x => x.Benefits)
            .MaximumLength(2000).WithMessage("Benefits cannot exceed 2000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Benefits));

        RuleFor(x => x.Location)
            .NotEmpty().WithMessage("Location is required.")
            .MaximumLength(200).WithMessage("Location cannot exceed 200 characters.");

        RuleFor(x => x.JobType)
            .Must(x => Enum.IsDefined(typeof(JobType), x)).WithMessage("Invalid job type.");

        RuleFor(x => x.WorkSetup)
            .Must(x => Enum.IsDefined(typeof(WorkSetup), x)).WithMessage("Invalid work setup.");

        RuleFor(x => x.SalaryMin)
            .GreaterThan(0).WithMessage("Minimum salary must be greater than 0.")
            .When(x => x.SalaryMin.HasValue);

        RuleFor(x => x.SalaryMax)
            .GreaterThan(0).WithMessage("Maximum salary must be greater than 0.")
            .GreaterThanOrEqualTo(x => x.SalaryMin).WithMessage("Maximum salary must be greater than or equal to minimum salary.")
            .When(x => x.SalaryMax.HasValue && x.SalaryMin.HasValue);

        RuleFor(x => x.ExperienceLevel)
            .MaximumLength(100).WithMessage("Experience level cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.ExperienceLevel));

        RuleFor(x => x.Openings)
            .GreaterThan(0).WithMessage("Openings must be at least 1.");

        RuleFor(x => x.Deadline)
            .GreaterThan(DateTime.UtcNow).WithMessage("Deadline must be in the future.")
            .When(x => x.Deadline.HasValue);
    }
}
