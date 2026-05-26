using FluentValidation;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.GetJobBoardJobs;

public class GetJobBoardJobsValidator : AbstractValidator<GetJobBoardJobsQuery>
{
    public GetJobBoardJobsValidator()
    {
        // No input fields to validate (public job board list).
    }
}

