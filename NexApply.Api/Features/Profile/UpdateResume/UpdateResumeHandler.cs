using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Contracts.Common;
using NexApply.Contracts.Profile.Commands;
using NexApply.Contracts.Profile.Dtos;
using System.Text.Json;

namespace NexApply.Api.Features.Profile.UpdateResume;

public class UpdateResumeHandler(AppDbContext context, CurrentUser currentUser) : IRequestHandler<UpdateResumeCommand, Result<ResumeContentDto>>
{
    public async Task<Result<ResumeContentDto>> Handle(UpdateResumeCommand request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);
        var profile = await context.StudentProfiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        
        if (profile is null) return Result<ResumeContentDto>.NotFound("Profile not found");

        var resume = await context.Resumes.FirstOrDefaultAsync(r => r.StudentProfileId == profile.Id, ct);

        if (resume is null)
        {
            resume = Resume.Create(profile.Id);
            resume.UpdateContent(request.Headline, request.AboutMe, request.EducationJson, request.WorkExperienceJson, request.SkillsJson);
            context.Resumes.Add(resume);
        }
        else
        {
            resume.UpdateContent(request.Headline, request.AboutMe, request.EducationJson, request.WorkExperienceJson, request.SkillsJson);
        }

        await context.SaveChangesAsync(ct);

        var education = JsonSerializer.Deserialize<List<EducationDto>>(request.EducationJson) ?? new();
        var workExperience = JsonSerializer.Deserialize<List<WorkExperienceDto>>(request.WorkExperienceJson) ?? new();
        var skills = JsonSerializer.Deserialize<List<string>>(request.SkillsJson) ?? new();

        return Result<ResumeContentDto>.Success(new ResumeContentDto
        {
            Headline = request.Headline,
            AboutMe = request.AboutMe,
            Education = education,
            WorkExperience = workExperience,
            Skills = skills
        });
    }
}
