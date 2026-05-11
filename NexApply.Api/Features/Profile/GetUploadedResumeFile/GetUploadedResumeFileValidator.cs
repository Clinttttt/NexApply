using FluentValidation;
using NexApply.Contracts.Profile.Queries;

namespace NexApply.Api.Features.Profile.GetUploadedResumeFile;

public class GetUploadedResumeFileValidator : AbstractValidator<GetUploadedResumeFileQuery>
{
    public GetUploadedResumeFileValidator()
    {
    }
}
