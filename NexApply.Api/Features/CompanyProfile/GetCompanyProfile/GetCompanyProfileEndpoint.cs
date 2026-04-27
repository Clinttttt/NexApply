using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyProfile.Queries;

namespace NexApply.Api.Features.CompanyProfile.GetCompanyProfile;

public static class GetCompanyProfileEndpoint
{
    public static IEndpointRouteBuilder MapGetCompanyProfile(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/company/profile", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetCompanyProfileQuery());
            return result.ToIResult();
        })
        .RequireAuthorization(policy => policy.RequireRole("Company"))
        .WithTags("Company Profile");

        return app;
    }
}
