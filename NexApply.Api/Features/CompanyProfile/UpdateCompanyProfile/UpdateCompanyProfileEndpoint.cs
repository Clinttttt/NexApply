using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyProfile.Commands;

namespace NexApply.Api.Features.CompanyProfile.UpdateCompanyProfile;

public static class UpdateCompanyProfileEndpoint
{
    public static IEndpointRouteBuilder MapUpdateCompanyProfile(this IEndpointRouteBuilder app)
    {
        app.MapPut("/api/company/profile", async (UpdateCompanyProfileCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.ToIResult();
        })
        .RequireAuthorization(policy => policy.RequireRole("Company"))
        .WithTags("Company Profile");
        
        return app;
    }
}
