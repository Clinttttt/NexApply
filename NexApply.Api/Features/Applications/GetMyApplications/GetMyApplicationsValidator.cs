using FluentValidation;
using NexApply.Contracts.Applications;

namespace NexApply.Api.Features.Applications.GetMyApplications;

public class GetMyApplicationsValidator : AbstractValidator<GetMyApplicationsQuery>
{
    public GetMyApplicationsValidator()
    {
        // No input fields to validate (query is based on authenticated user).
    }
}

