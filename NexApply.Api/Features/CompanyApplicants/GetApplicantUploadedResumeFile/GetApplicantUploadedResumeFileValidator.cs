using FluentValidation;
using NexApply.Contracts.CompanyApplicants;

namespace NexApply.Api.Features.CompanyApplicants.GetApplicantUploadedResumeFile;

public class GetApplicantUploadedResumeFileValidator : AbstractValidator<GetApplicantUploadedResumeFileQuery>
{
    public GetApplicantUploadedResumeFileValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
    }
}

