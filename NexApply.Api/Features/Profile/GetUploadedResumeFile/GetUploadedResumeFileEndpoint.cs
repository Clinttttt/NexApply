using MediatR;
using NexApply.Contracts.Profile.Queries;

namespace NexApply.Api.Features.Profile.GetUploadedResumeFile;

public static class GetUploadedResumeFileEndpoint
{
    public static void MapGetUploadedResumeFileEndpoint(this WebApplication app)
    {
        app.MapGet("/api/profile/resume/uploaded-file", async (ISender mediator) =>
        {
            var result = await mediator.Send(new GetUploadedResumeFileQuery());

            return result.IsSuccess && result.Value is not null
                ? Results.File(result.Value.FileData, result.Value.ContentType, result.Value.FileName)
                : Results.NotFound(new { result.Error });
        })
        .RequireAuthorization(policy => policy.RequireRole("Student"))
        .WithTags("Profile");
    }
}
