using System.Text.Json;
using System.Text.RegularExpressions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Common;
using NexApply.Contracts.StudentDashboard;

namespace NexApply.Api.Features.StudentDashboard.GetStudentDashboard;

public class GetStudentDashboardHandler(AppDbContext context, CurrentUser currentUser)
    : IRequestHandler<GetStudentDashboardQuery, Result<StudentDashboardDto>>
{
    private static readonly Regex WhitespaceRegex = new(@"\s+", RegexOptions.Compiled);

    public async Task<Result<StudentDashboardDto>> Handle(GetStudentDashboardQuery request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);

        var student = await context.StudentProfiles
            .Include(s => s.Resume)
            .FirstOrDefaultAsync(s => s.UserId == userId, ct);

        if (student is null)
            return Result<StudentDashboardDto>.NotFound("Student profile not found");

        var applications = await context.Applications
            .Include(a => a.JobListing)
            .ThenInclude(j => j.Company)
            .ThenInclude(c => c.CompanyProfile)
            .Where(a => a.StudentId == student.Id)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

        var resumeSkills = GetResumeSkills(student);
        var searchableResumeText = BuildSearchableResumeText(student, resumeSkills);

        var activeJobs = await context.JobListings
            .Include(j => j.Company)
            .ThenInclude(c => c.CompanyProfile)
            .Include(j => j.Applications)
            .Where(j => j.Status == JobListingStatus.Active)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync(ct);

        var appliedJobIds = applications.Select(a => a.JobListingId).ToHashSet();
        var jobMatches = activeJobs
            .Where(job => !appliedJobIds.Contains(job.Id))
            .Select(job => BuildJobMatch(job, resumeSkills, searchableResumeText))
            .OrderByDescending(job => job.MatchScore)
            .ThenByDescending(job => activeJobs.First(activeJob => activeJob.Id == job.JobListingId).CreatedAt)
            .ToList();

        var today = DateTime.UtcNow.Date;

        var dashboard = new StudentDashboardDto
        {
            StudentName = student.FullName,
            ProfilePictureUrl = student.ProfilePictureUrl,
            AppliedCount = applications.Count,
            UnderReviewCount = applications.Count(a => a.Status == ApplicationStatus.UnderReview),
            ShortlistedCount = applications.Count(a => a.Status == ApplicationStatus.Shortlisted),
            InterviewCount = applications.Count(a => a.Status == ApplicationStatus.ForInterview),
            NewMatchesCount = jobMatches.Count,
            NewListingsTodayCount = activeJobs.Count(j => j.CreatedAt.Date == today),
            AwaitingUpdateCount = applications.Count(a => a.Status is ApplicationStatus.Submitted or ApplicationStatus.UnderReview),
            ResumeStrength = BuildResumeStrength(student, resumeSkills),
            RecentApplications = applications.Take(3).Select(BuildRecentApplication).ToList(),
            TopJobMatches = jobMatches.Take(3).ToList()
        };

        return Result<StudentDashboardDto>.Success(dashboard);
    }

    private static StudentDashboardApplicationDto BuildRecentApplication(Application application)
    {
        var companyName = GetCompanyName(application.JobListing);

        return new StudentDashboardApplicationDto
        {
            ApplicationId = application.Id,
            JobListingId = application.JobListingId,
            Title = application.JobListing.Title,
            Company = companyName,
            WorkSetup = FormatWorkSetup(application.JobListing.WorkSetup),
            Status = FormatApplicationStatus(application.Status),
            AppliedAt = application.CreatedAt,
            LogoText = BuildLogoText(companyName)
        };
    }

    private static StudentDashboardJobMatchDto BuildJobMatch(JobListing job, List<string> resumeSkills, string searchableResumeText)
    {
        var requiredSkills = ParseSkills(job.RequiredSkills);
        var allMatchedSkills = requiredSkills
            .Where(skill => IsSkillMatched(skill, resumeSkills, searchableResumeText))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        return new StudentDashboardJobMatchDto
        {
            JobListingId = job.Id,
            Title = job.Title,
            Company = GetCompanyName(job),
            WorkSetup = FormatWorkSetup(job.WorkSetup),
            JobType = FormatJobType(job.JobType),
            MatchScore = CalculateMatchScore(requiredSkills.Count, allMatchedSkills.Count),
            MatchedSkills = allMatchedSkills.Count > 0 ? allMatchedSkills.Take(3).ToList() : requiredSkills.Take(3).ToList()
        };
    }

    private static ResumeStrengthDto BuildResumeStrength(StudentProfile student, List<string> resumeSkills)
    {
        var hasWorkExperience = !string.IsNullOrWhiteSpace(student.Resume?.WorkExperienceJson)
            && student.Resume.WorkExperienceJson != "[]";
        var hasSkills = resumeSkills.Count >= 3;
        var hasPortfolio = !string.IsNullOrWhiteSpace(student.Portfolio)
            || !string.IsNullOrWhiteSpace(student.LinkedIn)
            || !string.IsNullOrWhiteSpace(student.GitHub);
        var hasLatestResume = !string.IsNullOrWhiteSpace(student.ResumeFilePath)
            || student.Resume is not null;

        var score = 0;
        score += !string.IsNullOrWhiteSpace(student.FullName) ? 15 : 0;
        score += !string.IsNullOrWhiteSpace(student.Phone) ? 10 : 0;
        score += !string.IsNullOrWhiteSpace(student.Location) ? 10 : 0;
        score += hasWorkExperience ? 25 : 0;
        score += hasSkills ? 20 : 0;
        score += hasPortfolio ? 10 : 0;
        score += hasLatestResume ? 10 : 0;

        return new ResumeStrengthDto
        {
            Score = Math.Min(100, score),
            HasWorkExperience = hasWorkExperience,
            HasSkills = hasSkills,
            HasPortfolio = hasPortfolio,
            HasLatestResume = hasLatestResume
        };
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

    private static string GetCompanyName(JobListing job)
    {
        return job.Company.CompanyProfile?.CompanyName ?? job.Company.Username;
    }

    private static string FormatApplicationStatus(ApplicationStatus status) => status switch
    {
        ApplicationStatus.Submitted => "Submitted",
        ApplicationStatus.UnderReview => "Under Review",
        ApplicationStatus.Shortlisted => "Shortlisted",
        ApplicationStatus.ForInterview => "Interview",
        ApplicationStatus.Declined => "Declined",
        ApplicationStatus.Decided => "Decided",
        _ => status.ToString()
    };

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

    private static string BuildLogoText(string companyName)
    {
        var words = companyName
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Take(2)
            .Select(word => char.ToUpperInvariant(word[0]));

        var logoText = string.Concat(words);
        return string.IsNullOrWhiteSpace(logoText) ? "NA" : logoText;
    }
}
