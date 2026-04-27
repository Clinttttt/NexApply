using MediatR;
using Microsoft.AspNetCore.Mvc;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.GetJobListingDetails;

public static class GetJobListingDetailsEndpoint
{
    public static void MapGetJobListingDetailsEndpoint(this WebApplication app)
    {
        app.MapGet("/api/job-listings/{id:guid}/details", async (
            [FromRoute] Guid id,
            IMediator mediator) =>
        {
            var query = new GetJobListingDetailsQuery(id);
            var result = await mediator.Send(query);
            return result.ToIResult();
        })
        .RequireAuthorization(policy => policy.RequireRole("Company"))
        .WithTags("Job Listings")
        .WithName("GetJobListingDetails")
        .Produces<Result<JobListingDetailsDto>>(200)
        .Produces(401)
        .Produces(403)
        .Produces(404);
    }
}
