using FluentValidation;
using NexApply.Contracts.CompanySettings;

namespace NexApply.Api.Features.CompanySettings.UpdateCompanyTestimonial;

public class UpdateCompanyTestimonialValidator : AbstractValidator<UpdateCompanyTestimonialCommand>
{
    public UpdateCompanyTestimonialValidator()
    {
        RuleFor(x => x.Testimonial).MaximumLength(200);
    }
}

