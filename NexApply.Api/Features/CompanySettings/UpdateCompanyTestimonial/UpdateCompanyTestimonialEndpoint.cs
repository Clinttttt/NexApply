using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanySettings;

namespace NexApply.Api.Features.CompanySettings.UpdateCompanyTestimonial;

public static class UpdateCompanyTestimonialEndpoint
{
    public static IEndpointRouteBuilder MapUpdateCompanyTestimonial(this IEndpointRouteBuilder app)
    {
        app.MapPut("/api/company/settings/testimonial", async (UpdateCompanyTestimonialCommand command, IMediator mediator) =>
            {
                var result = await mediator.Send(command);
                return result.ToIResult();
            })
            .RequireAuthorization(policy => policy.RequireRole("Company"))
            .WithTags("Company Settings");

        return app;
    }
}

