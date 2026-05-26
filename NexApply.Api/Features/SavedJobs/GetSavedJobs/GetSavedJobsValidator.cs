using FluentValidation;
using NexApply.Contracts.SavedJobs;

namespace NexApply.Api.Features.SavedJobs.GetSavedJobs;

public class GetSavedJobsValidator : AbstractValidator<GetSavedJobsQuery>
{
    public GetSavedJobsValidator()
    {
        // No input fields to validate (query is based on authenticated user).
    }
}

