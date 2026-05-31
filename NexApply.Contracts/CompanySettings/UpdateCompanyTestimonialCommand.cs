using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.CompanySettings;

public record UpdateCompanyTestimonialCommand(string Testimonial) : IRequest<Result<CompanySettingsDto>>;

