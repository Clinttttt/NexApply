using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.StudentDashboard;

public static class GetStudentDashboard
{
    public sealed record Query : IRequest<Result<Response>>;

    public sealed class Response
    {
        public string StudentName { get; init; } = string.Empty;
        public string? ProfilePictureUrl { get; init; }
        public int AppliedCount { get; init; }
        public int UnderReviewCount { get; init; }
        public int ShortlistedCount { get; init; }
        public int InterviewCount { get; init; }
        public int NewMatchesCount { get; init; }
        public int NewListingsTodayCount { get; init; }
        public int AwaitingUpdateCount { get; init; }
        public ResumeStrength ResumeStrength { get; init; } = new();
        public List<DashboardApplication> RecentApplications { get; init; } = [];
        public List<DashboardJobMatch> TopJobMatches { get; init; } = [];
    }

    public sealed class DashboardApplication
    {
        public Guid ApplicationId { get; init; }
        public Guid JobListingId { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Company { get; init; } = string.Empty;
        public string WorkSetup { get; init; } = string.Empty;
        public string Status { get; init; } = string.Empty;
        public DateTime AppliedAt { get; init; }
        public string LogoText { get; init; } = string.Empty;
    }

    public sealed class DashboardJobMatch
    {
        public Guid JobListingId { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Company { get; init; } = string.Empty;
        public string WorkSetup { get; init; } = string.Empty;
        public string JobType { get; init; } = string.Empty;
        public int MatchScore { get; init; }
        public List<string> MatchedSkills { get; init; } = [];
    }

    public sealed class ResumeStrength
    {
        public int Score { get; init; }
        public bool HasWorkExperience { get; init; }
        public bool HasSkills { get; init; }
        public bool HasPortfolio { get; init; }
        public bool HasLatestResume { get; init; }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<Response>>
    {
        public async Task<Result<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var student = await context.StudentProfiles
                .Include(profile => profile.Resume)
                .FirstOrDefaultAsync(profile => profile.UserId == userId, cancellationToken);

            if (student is null)
            {
                return Result<Response>.NotFound("Student profile not found");
            }

            var applications = await context.Applications
                .Include(application => application.JobListing)
                .ThenInclude(listing => listing.Company)
                .ThenInclude(company => company.CompanyProfile)
                .Where(application => application.StudentId == student.Id)
                .OrderByDescending(application => application.CreatedAt)
                .ToListAsync(cancellationToken);

            var resumeSkills = SkillMatchScorer.GetResumeSkills(student);
            var searchableResumeText = SkillMatchScorer.BuildSearchableResumeText(student, resumeSkills);

            var activeJobs = await context.JobListings
                .Include(listing => listing.Company)
                .ThenInclude(company => company.CompanyProfile)
                .Include(listing => listing.Applications)
                .Where(listing => listing.Status == JobListingStatus.Active)
                .OrderByDescending(listing => listing.CreatedAt)
                .ToListAsync(cancellationToken);

            var appliedJobIds = applications.Select(application => application.JobListingId).ToHashSet();
            var jobMatches = activeJobs
                .Where(job => !appliedJobIds.Contains(job.Id))
                .Select(job => BuildJobMatch(job, resumeSkills, searchableResumeText))
                .OrderByDescending(job => job.MatchScore)
                .ThenByDescending(job => activeJobs.First(activeJob => activeJob.Id == job.JobListingId).CreatedAt)
                .ToList();

            var today = DateTime.UtcNow.Date;

            var dashboard = new Response
            {
                StudentName = student.FullName,
                ProfilePictureUrl = student.ProfilePictureUrl,
                AppliedCount = applications.Count,
                UnderReviewCount = applications.Count(application => application.Status == ApplicationStatus.UnderReview),
                ShortlistedCount = applications.Count(application => application.Status == ApplicationStatus.Shortlisted),
                InterviewCount = applications.Count(application => application.Status == ApplicationStatus.ForInterview),
                NewMatchesCount = jobMatches.Count,
                NewListingsTodayCount = activeJobs.Count(listing => listing.CreatedAt.Date == today),
                AwaitingUpdateCount = applications.Count(application =>
                    application.Status is ApplicationStatus.Submitted or ApplicationStatus.UnderReview),
                ResumeStrength = BuildResumeStrength(student, resumeSkills),
                RecentApplications = applications.Take(3).Select(BuildRecentApplication).ToList(),
                TopJobMatches = jobMatches.Take(3).ToList()
            };

            return Result<Response>.Success(dashboard);
        }

        private static DashboardApplication BuildRecentApplication(Application application)
        {
            var companyName = GetCompanyName(application.JobListing);

            return new DashboardApplication
            {
                ApplicationId = application.Id,
                JobListingId = application.JobListingId,
                Title = application.JobListing.Title,
                Company = companyName,
                WorkSetup = application.JobListing.WorkSetup.ToDisplayName(),
                Status = FormatApplicationStatus(application.Status),
                AppliedAt = application.CreatedAt,
                LogoText = BuildLogoText(companyName)
            };
        }

        private static DashboardJobMatch BuildJobMatch(
            JobListing job,
            List<string> resumeSkills,
            string searchableResumeText)
        {
            var requiredSkills = SkillMatchScorer.ParseSkills(job.RequiredSkills);
            var allMatchedSkills = requiredSkills
                .Where(skill => SkillMatchScorer.IsSkillMatched(skill, resumeSkills, searchableResumeText))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            return new DashboardJobMatch
            {
                JobListingId = job.Id,
                Title = job.Title,
                Company = GetCompanyName(job),
                WorkSetup = job.WorkSetup.ToDisplayName(),
                JobType = job.JobType.ToDisplayName(),
                MatchScore = CalculateMatchScore(requiredSkills.Count, allMatchedSkills.Count),
                MatchedSkills = allMatchedSkills.Count > 0
                    ? allMatchedSkills.Take(3).ToList()
                    : requiredSkills.Take(3).ToList()
            };
        }

        private static ResumeStrength BuildResumeStrength(StudentProfile student, List<string> resumeSkills)
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

            return new ResumeStrength
            {
                Score = Math.Min(100, score),
                HasWorkExperience = hasWorkExperience,
                HasSkills = hasSkills,
                HasPortfolio = hasPortfolio,
                HasLatestResume = hasLatestResume
            };
        }

        private static int CalculateMatchScore(int requiredSkillCount, int matchedSkillCount)
        {
            if (requiredSkillCount == 0)
            {
                return 0;
            }

            return (int)Math.Round((double)matchedSkillCount / requiredSkillCount * 100, MidpointRounding.AwayFromZero);
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

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetStudentDashboard));
}
