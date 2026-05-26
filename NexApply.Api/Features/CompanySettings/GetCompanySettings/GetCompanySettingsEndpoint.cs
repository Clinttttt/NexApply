using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanySettings;

namespace NexApply.Api.Features.CompanySettings.GetCompanySettings;

public static class GetCompanySettingsEndpoint
{
    public static IEndpointRouteBuilder MapGetCompanySettings(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/company/settings", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetCompanySettingsQuery());
            return result.ToIResult();
        })
        .RequireAuthorization(policy => policy.RequireRole("Company"))
        .WithTags("Company Settings");

        return app;
    }
}

