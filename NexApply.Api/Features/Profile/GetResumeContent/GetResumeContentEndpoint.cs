using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Profile.Dtos;
using NexApply.Contracts.Profile.Queries;

namespace NexApply.Api.Features.Profile.GetResumeContent;

public static class GetResumeContentEndpoint
{
    public static void MapGetResumeContentEndpoint(this WebApplication app)
    {
        app.MapGet("/api/profile/resume/content", async (ISender mediator) =>
        {
            var result = await mediator.Send(new GetResumeContentQuery());
            return ResultExtensions.ToIResult(result);
        })
        .RequireAuthorization()
        .Produces<ResumeContentDto>(200)
        .Produces(404)
        .WithTags("Profile");
    }
}
