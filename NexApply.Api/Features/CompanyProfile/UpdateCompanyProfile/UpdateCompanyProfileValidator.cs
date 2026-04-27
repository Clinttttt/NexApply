using FluentValidation;
using NexApply.Contracts.CompanyProfile.Commands;

namespace NexApply.Api.Features.CompanyProfile.UpdateCompanyProfile;

public class UpdateCompanyProfileValidator : AbstractValidator<UpdateCompanyProfileCommand>
{
    public UpdateCompanyProfileValidator()
    {
        RuleFor(x => x.CompanyName)
            .NotEmpty().WithMessage("Company name is required")
            .MaximumLength(200).WithMessage("Company name cannot exceed 200 characters");

        RuleFor(x => x.Tagline)
            .MaximumLength(200).When(x => !string.IsNullOrEmpty(x.Tagline))
            .WithMessage("Tagline cannot exceed 200 characters");

        RuleFor(x => x.Website)
            .MaximumLength(500).When(x => !string.IsNullOrEmpty(x.Website))
            .WithMessage("Website URL cannot exceed 500 characters");

        RuleFor(x => x.Industry)
            .MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Industry))
            .WithMessage("Industry cannot exceed 100 characters");

        RuleFor(x => x.Location)
            .MaximumLength(200).When(x => !string.IsNullOrEmpty(x.Location))
            .WithMessage("Location cannot exceed 200 characters");

        RuleFor(x => x.CompanySize)
            .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.CompanySize))
            .WithMessage("Company size cannot exceed 50 characters");

        RuleFor(x => x.Founded)
            .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.Founded))
            .WithMessage("Founded cannot exceed 50 characters");

        RuleFor(x => x.ContactEmail)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.ContactEmail))
            .WithMessage("Invalid email address");

        RuleFor(x => x.ContactPhone)
            .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.ContactPhone))
            .WithMessage("Phone number cannot exceed 50 characters");

        RuleFor(x => x.LinkedInUrl)
            .MaximumLength(500).When(x => !string.IsNullOrEmpty(x.LinkedInUrl))
            .WithMessage("LinkedIn URL cannot exceed 500 characters");

        RuleFor(x => x.GitHubUrl)
            .MaximumLength(500).When(x => !string.IsNullOrEmpty(x.GitHubUrl))
            .WithMessage("GitHub URL cannot exceed 500 characters");
    }
}
