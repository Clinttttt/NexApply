using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;

namespace NexApply.Api.Features.Profile;

public static class GetUploadedResumeFile
{
    public sealed record Query : IRequest<Result<Response>>;

    public sealed class Response
    {
        public string FileName { get; init; } = string.Empty;
        public string ContentType { get; init; } = "application/octet-stream";
        public byte[] FileData { get; init; } = [];
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser, IWebHostEnvironment environment)
        : IRequestHandler<Query, Result<Response>>
    {
        public async Task<Result<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var profile = await context.StudentProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(candidate => candidate.UserId == userId, cancellationToken);

            if (profile is null)
            {
                return Result<Response>.NotFound("Profile not found");
            }

            if (string.IsNullOrWhiteSpace(profile.ResumeFilePath))
            {
                return Result<Response>.NotFound("No uploaded resume found");
            }

            var filePath = Path.Combine(
                ResumeStorage.FolderPath(environment.ContentRootPath),
                profile.ResumeFilePath);

            if (!File.Exists(filePath))
            {
                return Result<Response>.NotFound("Uploaded resume file not found");
            }

            return Result<Response>.Success(new Response
            {
                FileName = profile.ResumeFilePath,
                ContentType = ResumeStorage.ResolveContentType(profile.ResumeFilePath),
                FileData = await File.ReadAllBytesAsync(filePath, cancellationToken)
            });
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/resume/uploaded-file", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);

                return result.IsSuccess && result.Value is not null
                    ? Results.File(result.Value.FileData, result.Value.ContentType, result.Value.FileName)
                    : Results.NotFound(new { result.Error });
            })
            .RequireAuthorization(policy => policy.RequireRole("Student"))
            .WithName(nameof(GetUploadedResumeFile));
}
