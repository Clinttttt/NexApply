using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.GetStudentBrowseJobs;

public static class GetStudentBrowseJobsEndpoint
{
    public static IEndpointRouteBuilder MapGetStudentBrowseJobs(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/jobs/browse", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetStudentBrowseJobsQuery());
            return ResultExtensions.ToIResult(result);
        })
        .RequireAuthorization(policy => policy.RequireRole("Student"))
        .WithTags("Job Listings");

        return app;
    }
}
