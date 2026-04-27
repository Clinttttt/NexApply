using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.GetCompanyJobListings;

public static class GetCompanyJobListingsEndpoint
{
    public static IEndpointRouteBuilder MapGetCompanyJobListings(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/jobs/company", async (IMediator mediator) =>
        {
            var query = new GetCompanyJobListingsQuery();
            var result = await mediator.Send(query);
            return ResultExtensions.ToIResult(result);
        })
        .RequireAuthorization(policy => policy.RequireRole("Company"))
        .WithTags("Job Listings");

        return app;
    }
}
