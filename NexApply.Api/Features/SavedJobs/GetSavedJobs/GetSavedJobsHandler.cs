using System.Text.RegularExpressions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Common;
using NexApply.Contracts.SavedJobs;

namespace NexApply.Api.Features.SavedJobs.GetSavedJobs;

public class GetSavedJobsHandler(AppDbContext context, CurrentUser currentUser)
    : IRequestHandler<GetSavedJobsQuery, Result<List<SavedJobDto>>>
{
    private static readonly Regex WhitespaceRegex = new(@"\s+", RegexOptions.Compiled);

    public async Task<Result<List<SavedJobDto>>> Handle(GetSavedJobsQuery request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);

        var student = await context.StudentProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(profile => profile.UserId == userId, ct);

        if (student is null)
            return Result<List<SavedJobDto>>.NotFound("Student profile not found");

        var savedJobs = await context.SavedJobs
            .AsNoTracking()
            .Where(s => s.StudentId == student.Id)
            .Include(s => s.JobListing)
                .ThenInclude(j => j.Company)
                    .ThenInclude(u => u.CompanyProfile)
            .Include(s => s.JobListing)
                .ThenInclude(j => j.Applications)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new SavedJobDto
            {
                SavedJobId = s.Id,
                JobListingId = s.JobListingId,
                Title = s.JobListing.Title,
                Company = s.JobListing.Company.CompanyProfile != null
                    && s.JobListing.Company.CompanyProfile.CompanyName != null
                        ? s.JobListing.Company.CompanyProfile.CompanyName
                        : s.JobListing.Company.Username,
                Location = s.JobListing.Location,
                JobType = FormatJobType(s.JobListing.JobType),
                WorkSetup = FormatWorkSetup(s.JobListing.WorkSetup),
                Salary = FormatSalary(s.JobListing.SalaryMin, s.JobListing.SalaryMax),
                PostedAt = s.JobListing.CreatedAt,
                SavedAt = s.CreatedAt,
                HasApplied = s.JobListing.Applications.Any(a => a.StudentId == student.Id),
                Skills = ParseSkills(s.JobListing.RequiredSkills),
                Description = s.JobListing.Description
            })
            .ToListAsync(ct);

        return Result<List<SavedJobDto>>.Success(savedJobs);
    }

    private static List<string> ParseSkills(string requiredSkills)
    {
        if (string.IsNullOrWhiteSpace(requiredSkills))
            return [];

        return requiredSkills
            .Split([',', ';', '|', '\n', '\r'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(skill => WhitespaceRegex.Replace(skill, " "))
            .Where(skill => !string.IsNullOrWhiteSpace(skill))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static string FormatJobType(JobType jobType) => jobType switch
    {
        JobType.FullTime => "Full-time",
        JobType.PartTime => "Part-time",
        JobType.Internship => "Internship",
        JobType.Freelance => "Freelance",
        JobType.Remote => "Remote",
        _ => jobType.ToString()
    };

    private static string FormatWorkSetup(WorkSetup workSetup) => workSetup switch
    {
        WorkSetup.OnSite => "On-site",
        WorkSetup.Remote => "Remote",
        WorkSetup.Hybrid => "Hybrid",
        _ => workSetup.ToString()
    };

    private static string FormatSalary(decimal? salaryMin, decimal? salaryMax)
    {
        if (salaryMin.HasValue && salaryMax.HasValue)
            return $"PHP {salaryMin.Value:N0} - PHP {salaryMax.Value:N0}";

        if (salaryMin.HasValue)
            return $"From PHP {salaryMin.Value:N0}";

        if (salaryMax.HasValue)
            return $"Up to PHP {salaryMax.Value:N0}";

        return "Not specified";
    }
}
