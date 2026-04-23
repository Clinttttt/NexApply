using FluentValidation;
using NexApply.Contracts.Profile.Commands;

namespace NexApply.Api.Features.Profile.UploadResume;

public class UploadResumeValidator : AbstractValidator<UploadResumeCommand>
{
    public UploadResumeValidator()
    {
        RuleFor(x => x.FileName).NotEmpty();
        RuleFor(x => x.FileData).NotEmpty().Must(x => x.Length <= 5 * 1024 * 1024).WithMessage("File size must not exceed 5MB");
        RuleFor(x => x.ContentType).Must(x => x == "application/pdf" || x == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || x.StartsWith("image/"))
            .WithMessage("Only PDF, DOCX, and image files are allowed");
    }
}
