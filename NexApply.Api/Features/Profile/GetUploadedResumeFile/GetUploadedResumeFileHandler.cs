using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.Profile.Dtos;
using NexApply.Contracts.Profile.Queries;

namespace NexApply.Api.Features.Profile.GetUploadedResumeFile;

public class GetUploadedResumeFileHandler(AppDbContext context, CurrentUser currentUser, IWebHostEnvironment env)
    : IRequestHandler<GetUploadedResumeFileQuery, Result<UploadedResumeFileDto>>
{
    public async Task<Result<UploadedResumeFileDto>> Handle(GetUploadedResumeFileQuery request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);
        var profile = await context.StudentProfiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);

        if (profile is null)
            return Result<UploadedResumeFileDto>.NotFound("Profile not found");

        if (string.IsNullOrWhiteSpace(profile.ResumeFilePath))
            return Result<UploadedResumeFileDto>.NotFound("No uploaded resume found");

        var uploadsFolder = Path.Combine(env.ContentRootPath, "uploads", "resumes");
        var filePath = Path.Combine(uploadsFolder, profile.ResumeFilePath);

        if (!File.Exists(filePath))
            return Result<UploadedResumeFileDto>.NotFound("Uploaded resume file not found");

        var fileData = await File.ReadAllBytesAsync(filePath, ct);

        return Result<UploadedResumeFileDto>.Success(new UploadedResumeFileDto
        {
            FileName = profile.ResumeFilePath,
            ContentType = GetContentType(profile.ResumeFilePath),
            FileData = fileData
        });
    }

    private static string GetContentType(string fileName)
    {
        return Path.GetExtension(fileName).ToLowerInvariant() switch
        {
            ".pdf" => "application/pdf",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            _ => "application/octet-stream"
        };
    }
}
