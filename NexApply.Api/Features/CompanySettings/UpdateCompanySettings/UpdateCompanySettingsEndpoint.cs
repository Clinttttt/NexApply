using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanySettings;

namespace NexApply.Api.Features.CompanySettings.UpdateCompanySettings;

public static class UpdateCompanySettingsEndpoint
{
    public static IEndpointRouteBuilder MapUpdateCompanySettings(this IEndpointRouteBuilder app)
    {
        app.MapPut("/api/company/settings", async (UpdateCompanySettingsCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.ToIResult();
        })
        .RequireAuthorization(policy => policy.RequireRole("Company"))
        .WithTags("Company Settings");

        return app;
    }
}

