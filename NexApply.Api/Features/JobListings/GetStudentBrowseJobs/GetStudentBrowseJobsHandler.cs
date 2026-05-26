using System.Text.Json;
using System.Text.RegularExpressions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Api.Entities.Enums;
using NexApply.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.GetStudentBrowseJobs;

public class GetStudentBrowseJobsHandler(AppDbContext context, CurrentUser currentUser)
    : IRequestHandler<GetStudentBrowseJobsQuery, Result<CursorPagedResult<StudentBrowseJobDto>>>
{
    private static readonly Regex SentenceRegex = new(@"(?<=[.!?])\s+", RegexOptions.Compiled);
    private static readonly Regex WhitespaceRegex = new(@"\s+", RegexOptions.Compiled);

    public async Task<Result<CursorPagedResult<StudentBrowseJobDto>>> Handle(GetStudentBrowseJobsQuery request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);

        var student = await context.StudentProfiles
            .Include(s => s.Resume)
            .FirstOrDefaultAsync(s => s.UserId == userId, ct);

        if (student is null)
            return Result<CursorPagedResult<StudentBrowseJobDto>>.NotFound("Student profile not found");

        var resumeSkills = GetResumeSkills(student);
        var searchableResumeText = BuildSearchableResumeText(student, resumeSkills);

        var jobsQuery = context.JobListings
            .Include(j => j.Company)
            .ThenInclude(c => c.CompanyProfile)
            .Include(j => j.Applications)
            .Include(j => j.SavedByStudents)
            .Where(j => j.Status == JobListingStatus.Active)
            .OrderByDescending(j => j.CreatedAt)
            .AsQueryable();

        if (request.Cursor.HasValue)
        {
            // Cursor pagination based on CreatedAt (PostedAt in UI).
            jobsQuery = jobsQuery.Where(j => j.CreatedAt < request.Cursor.Value);
        }

        var pagedJobs = await jobsQuery.ToCursorPagedResultAsync(
            request.PageSize,
            job => job.CreatedAt,
            ct);

        var dtos = pagedJobs.Items
            .Select(job =>
            {
                var requiredSkills = ParseSkills(job.RequiredSkills);
                var matchedSkills = requiredSkills
                    .Where(skill => IsSkillMatched(skill, resumeSkills, searchableResumeText))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                var missingSkills = requiredSkills
                    .Where(skill => !matchedSkills.Contains(skill, StringComparer.OrdinalIgnoreCase))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                return new StudentBrowseJobDto
                {
                    Id = job.Id,
                    Title = job.Title,
                    Company = job.Company.CompanyProfile?.CompanyName ?? job.Company.Username,
                    JobType = FormatJobType(job.JobType),
                    WorkSetup = FormatWorkSetup(job.WorkSetup),
                    Location = job.Location,
                    MatchScore = CalculateMatchScore(requiredSkills.Count, matchedSkills.Count),
                    PostedAt = job.CreatedAt,
                    Applicants = job.Applications.Count,
                    Salary = FormatSalary(job.SalaryMin, job.SalaryMax),
                    LogoText = BuildLogoText(job.Company.CompanyProfile?.CompanyName ?? job.Company.Username),
                    IsSaved = job.SavedByStudents.Any(saved => saved.StudentId == student.Id),
                    HasApplied = job.Applications.Any(application => application.StudentId == student.Id),
                    MatchedSkills = matchedSkills,
                    MissingSkills = missingSkills,
                    Description = SplitText(job.Description),
                    Responsibilities = SplitText(job.Responsibilities),
                    Requirements = SplitText(job.Qualifications)
                };
            })
            .ToList();

        return Result<CursorPagedResult<StudentBrowseJobDto>>.Success(new CursorPagedResult<StudentBrowseJobDto>
        {
            Items = dtos,
            NextCursor = pagedJobs.NextCursor,
            HasMore = pagedJobs.HasMore
        });
    }

    private static List<string> GetResumeSkills(StudentProfile student)
    {
        if (!string.IsNullOrWhiteSpace(student.ResumeFilePath) && HasMeaningfulUploadedResumeText(student.ParsedResumeText))
            return [];

        if (student.Resume is null || string.IsNullOrWhiteSpace(student.Resume.SkillsJson))
            return [];

        try
        {
            return JsonSerializer.Deserialize<List<string>>(student.Resume.SkillsJson) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }

    private static string BuildSearchableResumeText(StudentProfile student, List<string> resumeSkills)
    {
        if (!string.IsNullOrWhiteSpace(student.ResumeFilePath) && HasMeaningfulUploadedResumeText(student.ParsedResumeText))
            return Normalize(student.ParsedResumeText!);

        var parts = new[]
        {
            student.ParsedResumeText,
            student.Resume?.Headline,
            student.Resume?.AboutMe,
            string.Join(' ', resumeSkills),
            student.Resume?.EducationJson,
            student.Resume?.WorkExperienceJson
        };

        return Normalize(string.Join(' ', parts.Where(part => !string.IsNullOrWhiteSpace(part))));
    }

    private static List<string> ParseSkills(string requiredSkills)
    {
        return requiredSkills
            .Split([',', ';', '|', '\n', '\r'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(skill => WhitespaceRegex.Replace(skill, " "))
            .Where(skill => !string.IsNullOrWhiteSpace(skill))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static bool IsSkillMatched(string requiredSkill, List<string> resumeSkills, string searchableResumeText)
    {
        var normalizedRequired = Normalize(requiredSkill);
        if (string.IsNullOrWhiteSpace(normalizedRequired))
            return false;

        var requiredVariants = GetSkillVariants(normalizedRequired);

        return resumeSkills.Any(skill =>
            {
                var resumeVariants = GetSkillVariants(Normalize(skill));
                return requiredVariants.Any(required => resumeVariants.Any(resume => SkillsEquivalent(required, resume)));
            })
            || requiredVariants.Any(variant => ContainsSkill(searchableResumeText, variant));
    }

    private static bool SkillsEquivalent(string requiredSkill, string resumeSkill)
    {
        return requiredSkill == resumeSkill
            || requiredSkill.Contains(resumeSkill, StringComparison.OrdinalIgnoreCase)
            || resumeSkill.Contains(requiredSkill, StringComparison.OrdinalIgnoreCase);
    }

    private static bool ContainsSkill(string resumeText, string requiredSkill)
    {
        return Regex.IsMatch(resumeText, $@"(^|[^a-z0-9+#.]){Regex.Escape(requiredSkill)}([^a-z0-9+#.]|$)", RegexOptions.IgnoreCase);
    }

    private static bool HasMeaningfulUploadedResumeText(string? parsedResumeText)
    {
        if (string.IsNullOrWhiteSpace(parsedResumeText))
            return false;

        var normalized = Normalize(parsedResumeText);
        return !normalized.StartsWith("uploaded resume image:", StringComparison.OrdinalIgnoreCase)
            && !normalized.StartsWith("uploaded resume:", StringComparison.OrdinalIgnoreCase)
            && normalized.Length >= 20;
    }

    private static HashSet<string> GetSkillVariants(string skill)
    {
        var variants = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { skill };
        var compact = skill.Replace(" ", "");
        variants.Add(compact);

        if (skill.EndsWith(" apis", StringComparison.OrdinalIgnoreCase))
            variants.Add(skill[..^1]);

        if (skill.EndsWith(" api", StringComparison.OrdinalIgnoreCase))
            variants.Add($"{skill}s");

        if (skill is "c#" or "c sharp" or "csharp")
        {
            variants.Add("c#");
            variants.Add("c sharp");
            variants.Add("csharp");
        }

        if (skill.StartsWith(".net", StringComparison.OrdinalIgnoreCase) || skill.StartsWith("dotnet", StringComparison.OrdinalIgnoreCase))
        {
            variants.Add(".net");
            variants.Add("dotnet");
            variants.Add(skill.Replace(".net", "dotnet", StringComparison.OrdinalIgnoreCase));
            variants.Add(skill.Replace("dotnet", ".net", StringComparison.OrdinalIgnoreCase));
        }

        if (skill.Contains("javascript", StringComparison.OrdinalIgnoreCase))
            variants.Add(skill.Replace("javascript", "js", StringComparison.OrdinalIgnoreCase));

        if (skill.Contains("typescript", StringComparison.OrdinalIgnoreCase))
            variants.Add(skill.Replace("typescript", "ts", StringComparison.OrdinalIgnoreCase));

        return variants;
    }

    private static int CalculateMatchScore(int requiredSkillCount, int matchedSkillCount)
    {
        if (requiredSkillCount == 0)
            return 0;

        return (int)Math.Round((double)matchedSkillCount / requiredSkillCount * 100, MidpointRounding.AwayFromZero);
    }

    private static string Normalize(string value)
    {
        return WhitespaceRegex.Replace(value.Trim().ToLowerInvariant(), " ");
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

    private static string BuildLogoText(string companyName)
    {
        var words = companyName
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Take(2)
            .Select(word => char.ToUpperInvariant(word[0]));

        var logoText = string.Concat(words);
        return string.IsNullOrWhiteSpace(logoText) ? "NA" : logoText;
    }

    private static List<string> SplitText(string text)
    {
        return SentenceRegex
            .Split(text.Trim())
            .Select(sentence => sentence.Trim())
            .Where(sentence => !string.IsNullOrWhiteSpace(sentence))
            .ToList();
    }
}
