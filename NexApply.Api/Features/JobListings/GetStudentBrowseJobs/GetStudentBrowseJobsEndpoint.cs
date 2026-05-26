using MediatR;
using Microsoft.AspNetCore.Mvc;
using NexApply.Api.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.GetStudentBrowseJobs;

public static class GetStudentBrowseJobsEndpoint
{
    public static IEndpointRouteBuilder MapGetStudentBrowseJobs(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/jobs/browse", async (
            [FromQuery] DateTime? cursor,
            [FromQuery] int? pageSize,
            IMediator mediator) =>
        {
            var result = await mediator.Send(new GetStudentBrowseJobsQuery(cursor, pageSize ?? 10));
            return ResultExtensions.ToIResult(result);
        })
        .RequireAuthorization(policy => policy.RequireRole("Student"))
        .WithTags("Job Listings");

        return app;
    }
}
