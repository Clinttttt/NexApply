using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Profile.Commands;
using NexApply.Contracts.Profile.Dtos;

namespace NexApply.Api.Features.Profile.UploadResume;

public static class UploadResumeEndpoint
{
    public static void MapUploadResumeEndpoint(this WebApplication app)
    {
        app.MapPost("/api/profile/resume/upload", async (UploadResumeCommand request, ISender mediator) =>
        {
            var result = await mediator.Send(request);
            return ResultExtensions.ToIResult(result);
        })
        .RequireAuthorization()
        .Accepts<UploadResumeCommand>("application/json")
        .Produces<ResumeUploadDto>(200)
        .Produces(404)
        .WithTags("Profile");
    }
}
