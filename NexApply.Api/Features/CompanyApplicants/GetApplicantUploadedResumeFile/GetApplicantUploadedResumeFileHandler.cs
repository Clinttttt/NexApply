using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyApplicants;
using NexApply.Contracts.Profile.Dtos;

namespace NexApply.Api.Features.CompanyApplicants.GetApplicantUploadedResumeFile;

public class GetApplicantUploadedResumeFileHandler(AppDbContext context, CurrentUser currentUser, IWebHostEnvironment env)
    : IRequestHandler<GetApplicantUploadedResumeFileQuery, Result<UploadedResumeFileDto>>
{
    public async Task<Result<UploadedResumeFileDto>> Handle(GetApplicantUploadedResumeFileQuery request, CancellationToken ct)
    {
        var companyId = Guid.Parse(currentUser.UserId);

        var application = await context.Applications
            .Include(a => a.Student)
            .Include(a => a.JobListing)
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId && a.JobListing.CompanyId == companyId, ct);

        if (application is null)
            return Result<UploadedResumeFileDto>.NotFound();

        var resumeFilePath = application.Student.ResumeFilePath;
        if (string.IsNullOrWhiteSpace(resumeFilePath))
            return Result<UploadedResumeFileDto>.NotFound("No uploaded resume found");

        var uploadsFolder = Path.Combine(env.ContentRootPath, "uploads", "resumes");
        var filePath = Path.Combine(uploadsFolder, resumeFilePath);

        if (!File.Exists(filePath))
            return Result<UploadedResumeFileDto>.NotFound("Uploaded resume file not found");

        var fileData = await File.ReadAllBytesAsync(filePath, ct);

        return Result<UploadedResumeFileDto>.Success(new UploadedResumeFileDto
        {
            FileName = resumeFilePath,
            ContentType = GetContentType(resumeFilePath),
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

