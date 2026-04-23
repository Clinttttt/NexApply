using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.Profile.Queries;
using NexApply.Contracts.Profile.Dtos;
using System.Text.Json;

namespace NexApply.Api.Features.Profile.GetResumeContent;

public class GetResumeContentHandler(AppDbContext context, CurrentUser currentUser) : IRequestHandler<GetResumeContentQuery, Result<ResumeContentDto>>
{
    // Simple models matching the JSON structure
    private class EducationJson
    {
        public string Organization { get; set; } = "";
        public string Period { get; set; } = "";
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
    }

    private class WorkExperienceJson
    {
        public string Organization { get; set; } = "";
        public string Period { get; set; } = "";
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
    }

    public async Task<Result<ResumeContentDto>> Handle(GetResumeContentQuery request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);
        var profile = await context.StudentProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);
        
        if (profile is null) return Result<ResumeContentDto>.NotFound("Profile not found");

        var resume = await context.Resumes.FirstOrDefaultAsync(r => r.StudentProfileId == profile.Id, ct);

        if (resume is null)
        {
            return Result<ResumeContentDto>.Success(new ResumeContentDto
            {
                FullName = profile.FullName,
                Phone = profile.Phone,
                Email = profile.User.Email,
                Location = profile.Location,
                Headline = null,
                AboutMe = null,
                Education = new(),
                WorkExperience = new(),
                Skills = new()
            });
        }

        // Deserialize from simple JSON structure
        var educationJson = JsonSerializer.Deserialize<List<EducationJson>>(resume.EducationJson) ?? new();
        var workExperienceJson = JsonSerializer.Deserialize<List<WorkExperienceJson>>(resume.WorkExperienceJson) ?? new();
        var skills = JsonSerializer.Deserialize<List<string>>(resume.SkillsJson) ?? new();

        // Map to DTOs
        var education = educationJson.Select(e => new EducationDto
        {
            Id = Guid.Empty,
            Institution = e.Organization,
            Degree = e.Title,
            StartYear = ParseYear(e.Period, true),
            EndYear = ParseYear(e.Period, false),
            Description = e.Description
        }).ToList();

        var workExperience = workExperienceJson.Select(w => new WorkExperienceDto
        {
            Id = Guid.Empty,
            Company = w.Organization,
            Position = w.Title,
            StartDate = ParseDate(w.Period, true),
            EndDate = ParseDate(w.Period, false),
            Description = w.Description
        }).ToList();

        return Result<ResumeContentDto>.Success(new ResumeContentDto
        {
            FullName = profile.FullName,
            Phone = profile.Phone,
            Email = profile.User.Email,
            Location = profile.Location,
            Headline = resume.Headline,
            AboutMe = resume.AboutMe,
            Education = education,
            WorkExperience = workExperience,
            Skills = skills
        });
    }

    private int? ParseYear(string period, bool isStart)
    {
        if (string.IsNullOrWhiteSpace(period)) return null;
        
        var parts = period.Split('-');
        if (parts.Length == 0) return null;

        var yearStr = isStart ? parts[0].Trim() : (parts.Length > 1 ? parts[1].Trim() : null);
        if (yearStr == null || yearStr.Contains("Present", StringComparison.OrdinalIgnoreCase)) return null;

        return int.TryParse(yearStr, out var year) ? year : null;
    }

    private DateTime? ParseDate(string period, bool isStart)
    {
        if (string.IsNullOrWhiteSpace(period)) return null;
        
        var parts = period.Split(new[] { '-', '–' }, StringSplitOptions.TrimEntries);
        if (parts.Length == 0) return null;

        var dateStr = isStart ? parts[0] : (parts.Length > 1 ? parts[1] : null);
        if (dateStr == null || dateStr.Contains("Present", StringComparison.OrdinalIgnoreCase)) return null;

        // Try parsing as full date (e.g., "Jan 2023")
        if (DateTime.TryParse(dateStr, out var date))
        {
            return date;
        }

        // Try parsing as year only (e.g., "2023")
        if (int.TryParse(dateStr, out var year))
        {
            return isStart ? new DateTime(year, 1, 1) : new DateTime(year, 12, 31);
        }

        return null;
    }
}
