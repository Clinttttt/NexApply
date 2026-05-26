using System.Text.RegularExpressions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.GetJobBoardJobs;

public class GetJobBoardJobsHandler(AppDbContext context)
    : IRequestHandler<GetJobBoardJobsQuery, Result<List<JobBoardJobDto>>>
{
    private static readonly Regex SentenceRegex = new(@"(?<=[.!?])\s+", RegexOptions.Compiled);
    private static readonly Regex WhitespaceRegex = new(@"\s+", RegexOptions.Compiled);

    public async Task<Result<List<JobBoardJobDto>>> Handle(GetJobBoardJobsQuery request, CancellationToken ct)
    {
        var jobs = await context.JobListings
            .AsNoTracking()
            .Include(j => j.Company)
                .ThenInclude(c => c.CompanyProfile)
            .Include(j => j.Applications)
            .Where(j => j.Status == JobListingStatus.Active)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync(ct);

        var dtos = jobs.Select(job => new JobBoardJobDto
            {
                Id = job.Id,
                Company = job.Company.CompanyProfile != null
                    && job.Company.CompanyProfile.CompanyName != null
                        ? job.Company.CompanyProfile.CompanyName
                        : job.Company.Username,
                Role = job.Title,
                Type = FormatJobType(job.JobType),
                Setup = FormatWorkSetup(job.WorkSetup),
                Location = job.Location,
                PostedAt = job.CreatedAt,
                Applicants = job.Applications.Count,
                Salary = FormatSalary(job.SalaryMin, job.SalaryMax),
                Skills = ParseSkills(job.RequiredSkills),
                About = job.Description,
                Responsibilities = SplitToBullets(job.Responsibilities),
                Requirements = SplitToBullets(job.Qualifications)
            })
            .ToList();

        return Result<List<JobBoardJobDto>>.Success(dtos);
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

    private static List<string> SplitToBullets(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return [];

        // Prefer newline-separated bullets if present, otherwise fall back to sentence split.
        var normalized = text.Replace("\r\n", "\n").Replace('\r', '\n');
        var newlineParts = normalized
            .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToList();

        if (newlineParts.Count >= 2)
            return newlineParts;

        return SentenceRegex
            .Split(WhitespaceRegex.Replace(text.Trim(), " "))
            .Select(x => x.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Take(12)
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
