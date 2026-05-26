using MediatR;
using Microsoft.AspNetCore.Mvc;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.DeleteJobListing;

public static class DeleteJobListingEndpoint
{
    public static IEndpointRouteBuilder MapDeleteJobListing(this IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/jobs/{id:guid}", async (
            [FromRoute] Guid id,
            IMediator mediator) =>
        {
            var command = new DeleteJobListingCommand(id);
            var result = await mediator.Send(command);
            return ResultExtensions.ToIResult(result);
        })
        .RequireAuthorization(policy => policy.RequireRole("Company"))
        .WithTags("Job Listings");

        return app;
    }
}

