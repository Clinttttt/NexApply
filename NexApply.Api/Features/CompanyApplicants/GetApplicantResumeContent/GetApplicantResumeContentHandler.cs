using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyApplicants;
using NexApply.Contracts.Profile.Dtos;

namespace NexApply.Api.Features.CompanyApplicants.GetApplicantResumeContent;

public class GetApplicantResumeContentHandler(AppDbContext context, CurrentUser currentUser)
    : IRequestHandler<GetApplicantResumeContentQuery, Result<ResumeContentDto>>
{
    // Models matching the stored JSON structure (legacy string-based resume builder).
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

    public async Task<Result<ResumeContentDto>> Handle(GetApplicantResumeContentQuery request, CancellationToken ct)
    {
        var companyId = Guid.Parse(currentUser.UserId);

        var application = await context.Applications
            .Include(a => a.Student)
                .ThenInclude(s => s.User)
            .Include(a => a.Student)
                .ThenInclude(s => s.Resume)
            .Include(a => a.JobListing)
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId && a.JobListing.CompanyId == companyId, ct);

        if (application is null)
            return Result<ResumeContentDto>.NotFound();

        var profile = application.Student;
        var resume = profile.Resume;

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

        var educationJson = JsonSerializer.Deserialize<List<EducationJson>>(resume.EducationJson) ?? new();
        var workExperienceJson = JsonSerializer.Deserialize<List<WorkExperienceJson>>(resume.WorkExperienceJson) ?? new();
        var skills = JsonSerializer.Deserialize<List<string>>(resume.SkillsJson) ?? new();

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
            IsCurrent = w.Period.Contains("present", StringComparison.OrdinalIgnoreCase),
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

    private static int? ParseYear(string period, bool isStart)
    {
        if (string.IsNullOrWhiteSpace(period)) return null;

        var parts = period.Split('-');
        if (parts.Length == 0) return null;

        var yearStr = isStart ? parts[0].Trim() : (parts.Length > 1 ? parts[1].Trim() : null);
        if (yearStr == null || yearStr.Contains("Present", StringComparison.OrdinalIgnoreCase)) return null;

        return int.TryParse(yearStr, out var year) ? year : null;
    }

    private static DateTime? ParseDate(string period, bool isStart)
    {
        if (string.IsNullOrWhiteSpace(period)) return null;

        var parts = period.Split(new[] { '-', '–' }, StringSplitOptions.TrimEntries);
        if (parts.Length == 0) return null;

        var dateStr = isStart ? parts[0] : (parts.Length > 1 ? parts[1] : null);
        if (dateStr == null || dateStr.Contains("Present", StringComparison.OrdinalIgnoreCase)) return null;

        if (DateTime.TryParse(dateStr, out var date))
            return date;

        if (int.TryParse(dateStr, out var year))
            return isStart ? new DateTime(year, 1, 1) : new DateTime(year, 12, 31);

        return null;
    }
}

