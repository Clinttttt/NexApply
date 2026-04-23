using FluentValidation;
using NexApply.Contracts.Profile.Commands;

namespace NexApply.Api.Features.Profile.UpdateStudentProfile;

public class UpdateStudentProfileValidator : AbstractValidator<UpdateStudentProfileCommand>
{
    public UpdateStudentProfileValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Phone).MaximumLength(20).When(x => !string.IsNullOrEmpty(x.Phone));
        RuleFor(x => x.Location).MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Location));
        RuleFor(x => x.University).MaximumLength(200).When(x => !string.IsNullOrEmpty(x.University));
        RuleFor(x => x.Course).MaximumLength(200).When(x => !string.IsNullOrEmpty(x.Course));
        RuleFor(x => x.GraduationYear).InclusiveBetween(1950, 2100).When(x => x.GraduationYear.HasValue);
    }
}
