using FluentValidation;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.GetStudentBrowseJobs;

public class GetStudentBrowseJobsValidator : AbstractValidator<GetStudentBrowseJobsQuery>
{
    public GetStudentBrowseJobsValidator()
    {
    }
}
