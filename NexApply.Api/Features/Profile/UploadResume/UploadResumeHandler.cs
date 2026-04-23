using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.Profile.Commands;
using NexApply.Contracts.Profile.Dtos;

namespace NexApply.Api.Features.Profile.UploadResume;

public class UploadResumeHandler(AppDbContext context, CurrentUser currentUser, IWebHostEnvironment env) : IRequestHandler<UploadResumeCommand, Result<ResumeUploadDto>>
{
    public async Task<Result<ResumeUploadDto>> Handle(UploadResumeCommand request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);
        var profile = await context.StudentProfiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        
        if (profile is null) return Result<ResumeUploadDto>.NotFound("Profile not found");

        var uploadsFolder = Path.Combine(env.ContentRootPath, "uploads", "resumes");
        Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}{Path.GetExtension(request.FileName)}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        await File.WriteAllBytesAsync(filePath, request.FileData, ct);

        var parsedText = $"Resume uploaded: {request.FileName}";
        
        profile.UpdateResume(fileName, parsedText);
        await context.SaveChangesAsync(ct);

        return Result<ResumeUploadDto>.Success(new ResumeUploadDto
        {
            FilePath = fileName,
            ParsedText = parsedText
        });
    }
}
