using FluentValidation;
using NexApply.Contracts.CompanyApplicants;

namespace NexApply.Api.Features.CompanyApplicants.GetApplicantResumeContent;

public class GetApplicantResumeContentValidator : AbstractValidator<GetApplicantResumeContentQuery>
{
    public GetApplicantResumeContentValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
    }
}

