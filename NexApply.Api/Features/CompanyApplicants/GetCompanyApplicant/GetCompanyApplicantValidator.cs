using FluentValidation;
using NexApply.Contracts.CompanyApplicants;

namespace NexApply.Api.Features.CompanyApplicants.GetCompanyApplicant;

public class GetCompanyApplicantValidator : AbstractValidator<GetCompanyApplicantQuery>
{
    public GetCompanyApplicantValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
    }
}

