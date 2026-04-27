using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.CreateJobListing;

public static class CreateJobListingEndpoint
{
    public static IEndpointRouteBuilder MapCreateJobListing(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/jobs", async (CreateJobListingCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return ResultExtensions.ToIResult(result);
        })
        .RequireAuthorization(policy => policy.RequireRole("Company"))
        .WithTags("Job Listings");

        return app;
    }
}
