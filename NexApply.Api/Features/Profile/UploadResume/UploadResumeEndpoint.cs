using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Profile.Commands;
using NexApply.Contracts.Profile.Dtos;

namespace NexApply.Api.Features.Profile.UploadResume;

public static class UploadResumeEndpoint
{
    public static void MapUploadResumeEndpoint(this WebApplication app)
    {
        app.MapPost("/api/profile/resume/upload", async (IFormFile file, ISender mediator, CancellationToken ct) =>
        {
            await using var stream = file.OpenReadStream();
            using var memoryStream = new MemoryStream();
            await stream.CopyToAsync(memoryStream, ct);

            var request = new UploadResumeCommand(
                file.FileName,
                file.ContentType,
                memoryStream.ToArray());

            var result = await mediator.Send(request);
            return ResultExtensions.ToIResult(result);
        })
        .RequireAuthorization(policy => policy.RequireRole("Student"))
        .DisableAntiforgery()
        .Accepts<IFormFile>("multipart/form-data")
        .Produces<ResumeUploadDto>(200)
        .Produces(404)
        .WithTags("Profile");
    }
}
