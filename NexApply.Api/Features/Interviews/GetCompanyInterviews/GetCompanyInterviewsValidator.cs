using FluentValidation;
using NexApply.Contracts.Interviews;

namespace NexApply.Api.Features.Interviews.GetCompanyInterviews;

public class GetCompanyInterviewsValidator : AbstractValidator<GetCompanyInterviewsQuery>
{
    public GetCompanyInterviewsValidator()
    {
        // No validation needed for parameterless query
    }
}
