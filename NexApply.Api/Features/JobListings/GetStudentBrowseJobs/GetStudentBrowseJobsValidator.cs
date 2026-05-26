using FluentValidation;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.GetStudentBrowseJobs;

public class GetStudentBrowseJobsValidator : AbstractValidator<GetStudentBrowseJobsQuery>
{
    public GetStudentBrowseJobsValidator()
    {
        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 50)
            .WithMessage("PageSize must be between 1 and 50");
    }
}
