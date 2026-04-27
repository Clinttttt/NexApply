using MediatR;
using Microsoft.AspNetCore.Mvc;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.UpdateJobListingStatus;

public static class UpdateJobListingStatusEndpoint
{
    public static IEndpointRouteBuilder MapUpdateJobListingStatus(this IEndpointRouteBuilder app)
    {
        app.MapPatch("/api/jobs/{id:guid}/status", async (
            [FromRoute] Guid id,
            [FromBody] UpdateJobListingStatusRequest request,
            IMediator mediator) =>
        {
            var command = new UpdateJobListingStatusCommand(id, request.Status);
            var result = await mediator.Send(command);
            return ResultExtensions.ToIResult(result);
        })
        .RequireAuthorization(policy => policy.RequireRole("Company"))
        .WithTags("Job Listings");

        return app;
    }
}

public record UpdateJobListingStatusRequest(int Status);
