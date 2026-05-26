using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.Applications;

namespace NexApply.Api.Features.Applications.GetMyApplications;

public static class GetMyApplicationsEndpoint
{
    public static void MapGetMyApplications(this WebApplication app)
    {
        app.MapGet("/api/applications", [Authorize(Roles = "Student")] async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetMyApplicationsQuery());
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Applications");
    }
}

