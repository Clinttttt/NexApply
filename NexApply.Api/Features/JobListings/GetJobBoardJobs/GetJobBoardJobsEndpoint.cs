using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.GetJobBoardJobs;

public static class GetJobBoardJobsEndpoint
{
    public static void MapGetJobBoardJobs(this WebApplication app)
    {
        app.MapGet("/api/jobs/board", async (IMediator mediator) =>
            {
                var result = await mediator.Send(new GetJobBoardJobsQuery());
                return ResultExtensions.ToIResult(result);
            })
            .WithTags("Public");
    }
}

