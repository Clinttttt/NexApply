using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.Interviews;

namespace NexApply.Api.Features.Interviews.ScheduleInterview;

public static class ScheduleInterviewEndpoint
{
    public static void MapScheduleInterview(this WebApplication app)
    {
        app.MapPost("/api/company/interviews", [Authorize(Roles = "Company")] async (
            ScheduleInterviewCommand command,
            IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Interviews");
    }
}
