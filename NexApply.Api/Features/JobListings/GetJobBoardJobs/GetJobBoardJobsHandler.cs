using System.Text.Json;
using System.Text.RegularExpressions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.GetJobBoardJobs;

public class GetJobBoardJobsHandler(AppDbContext context, CurrentUser currentUser)
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

        // Get student skills if user is authenticated
        List<string> studentSkills = [];
        if (!string.IsNullOrEmpty(currentUser.UserId) && Guid.TryParse(currentUser.UserId, out var userId))
        {
            Console.WriteLine($"[DEBUG] User authenticated: {userId}");
            
            // First, try to get skills from Resume builder
            var resume = await context.Resumes
                .AsNoTracking()
                .Include(r => r.StudentProfile)
                .Where(r => r.StudentProfile.UserId == userId)
                .FirstOrDefaultAsync(ct);

            if (resume != null && !string.IsNullOrWhiteSpace(resume.SkillsJson))
            {
                Console.WriteLine($"[DEBUG] Found Resume.SkillsJson: {resume.SkillsJson}");
                try
                {
                    var skillObjects = JsonSerializer.Deserialize<List<SkillDto>>(resume.SkillsJson);
                    studentSkills = skillObjects?.Select(s => s.Name).ToList() ?? [];
                    Console.WriteLine($"[DEBUG] Extracted {studentSkills.Count} skills from Resume builder");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[DEBUG] Error parsing SkillsJson: {ex.Message}");
                    studentSkills = [];
                }
            }

            // If no skills from Resume builder, try to extract from uploaded resume ParsedResumeText
            if (studentSkills.Count == 0)
            {
                var studentProfile = await context.StudentProfiles
                    .AsNoTracking()
                    .Where(sp => sp.UserId == userId)
                    .FirstOrDefaultAsync(ct);

                if (studentProfile != null && !string.IsNullOrWhiteSpace(studentProfile.ParsedResumeText))
                {
                    Console.WriteLine($"[DEBUG] Found ParsedResumeText, length: {studentProfile.ParsedResumeText.Length}");
                    studentSkills = ExtractSkillsFromText(studentProfile.ParsedResumeText);
                    Console.WriteLine($"[DEBUG] Extracted {studentSkills.Count} skills from uploaded resume");
                }
                else
                {
                    Console.WriteLine($"[DEBUG] No ParsedResumeText found");
                }
            }
        }
        else
        {
            Console.WriteLine($"[DEBUG] User not authenticated or invalid UserId: {currentUser.UserId}");
        }

        Console.WriteLine($"[DEBUG] Total student skills: {studentSkills.Count}");

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
                Requirements = SplitToBullets(job.Qualifications),
                MatchPercentage = CalculateMatchPercentage(ParseSkills(job.RequiredSkills), studentSkills)
            })
            .ToList();

        return Result<List<JobBoardJobDto>>.Success(dtos);
    }

    private static int CalculateMatchPercentage(List<string> jobSkills, List<string> studentSkills)
    {
        Console.WriteLine($"[DEBUG] Calculating match - Job skills: {jobSkills.Count}, Student skills: {studentSkills.Count}");
        
        if (jobSkills.Count == 0 || studentSkills.Count == 0)
        {
            Console.WriteLine($"[DEBUG] Returning 0% - missing skills");
            return 0;
        }

        var normalizedJobSkills = jobSkills.Select(s => s.ToLowerInvariant().Trim()).ToHashSet();
        var normalizedStudentSkills = studentSkills.Select(s => s.ToLowerInvariant().Trim()).ToHashSet();

        Console.WriteLine($"[DEBUG] Job skills: {string.Join(", ", normalizedJobSkills.Take(5))}...");
        Console.WriteLine($"[DEBUG] Student skills (first 10): {string.Join(", ", normalizedStudentSkills.Take(10))}...");

        var matchedSkills = normalizedJobSkills.Intersect(normalizedStudentSkills).Count();
        var percentage = (int)Math.Round((double)matchedSkills / normalizedJobSkills.Count * 100);
        
        Console.WriteLine($"[DEBUG] Matched {matchedSkills} skills, percentage: {percentage}%");
        
        return percentage;
    }

    private static List<string> ExtractSkillsFromText(string parsedText)
    {
        if (string.IsNullOrWhiteSpace(parsedText))
            return [];

        // Extract words/phrases from the resume text
        var words = WhitespaceRegex.Split(parsedText)
            .Select(w => w.Trim().Trim(',', '.', ';', ':', '(', ')', '[', ']', '{', '}'))
            .Where(w => !string.IsNullOrWhiteSpace(w))
            .ToList();

        return words;
    }

    private class SkillDto
    {
        public string Name { get; set; } = string.Empty;
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
