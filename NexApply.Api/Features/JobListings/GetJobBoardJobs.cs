using System.Text.Json;
using System.Text.RegularExpressions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.JobListings;

public static class GetJobBoardJobs
{
    public sealed record Query : IRequest<Result<List<Response>>>;

    public sealed class Response
    {
        public Guid Id { get; init; }
        public string Company { get; init; } = string.Empty;
        public string Role { get; init; } = string.Empty;
        public string Type { get; init; } = string.Empty;
        public string Setup { get; init; } = string.Empty;
        public string Location { get; init; } = string.Empty;
        public DateTime PostedAt { get; init; }
        public int Applicants { get; init; }
        public string Salary { get; init; } = string.Empty;
        public int MatchPercentage { get; init; }
        public List<string> Skills { get; init; } = [];
        public string About { get; init; } = string.Empty;
        public List<string> Responsibilities { get; init; } = [];
        public List<string> Requirements { get; init; } = [];
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<List<Response>>>
    {
        private const int MaxBullets = 12;

        private static readonly Regex SentenceRegex = new(@"(?<=[.!?])\s+", RegexOptions.Compiled);
        private static readonly Regex WhitespaceRegex = new(@"\s+", RegexOptions.Compiled);

        private sealed record StoredSkill(string Name);

        public async Task<Result<List<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var jobs = await context.JobListings
                .AsNoTracking()
                .Include(listing => listing.Company)
                    .ThenInclude(company => company.CompanyProfile)
                .Include(listing => listing.Applications)
                .Where(listing => listing.Status == JobListingStatus.Active)
                .OrderByDescending(listing => listing.CreatedAt)
                .ToListAsync(cancellationToken);

            var studentSkills = await GetStudentSkillsAsync(cancellationToken);

            var responses = jobs
                .Select(job =>
                {
                    var jobSkills = SkillMatchScorer.ParseSkills(job.RequiredSkills);

                    return new Response
                    {
                        Id = job.Id,
                        Company = job.Company.CompanyProfile is not null
                            ? job.Company.CompanyProfile.CompanyName
                            : job.Company.Username,
                        Role = job.Title,
                        Type = job.JobType.ToDisplayName(),
                        Setup = job.WorkSetup.ToDisplayName(),
                        Location = job.Location,
                        PostedAt = job.CreatedAt,
                        Applicants = job.Applications.Count,
                        Salary = SalaryRange.Format(job.SalaryMin, job.SalaryMax),
                        Skills = jobSkills,
                        About = job.Description,
                        Responsibilities = SplitToBullets(job.Responsibilities),
                        Requirements = SplitToBullets(job.Qualifications),
                        MatchPercentage = CalculateMatchPercentage(jobSkills, studentSkills)
                    };
                })
                .ToList();

            return Result<List<Response>>.Success(responses);
        }

        private async Task<List<string>> GetStudentSkillsAsync(CancellationToken cancellationToken)
        {
            if (!Guid.TryParse(currentUser.UserId, out var userId))
            {
                return [];
            }

            var resume = await context.Resumes
                .AsNoTracking()
                .Include(candidate => candidate.StudentProfile)
                .FirstOrDefaultAsync(candidate => candidate.StudentProfile.UserId == userId, cancellationToken);

            var skills = ReadSkills(resume?.SkillsJson);
            if (skills.Count > 0)
            {
                return skills;
            }

            var parsedResumeText = await context.StudentProfiles
                .AsNoTracking()
                .Where(profile => profile.UserId == userId)
                .Select(profile => profile.ParsedResumeText)
                .FirstOrDefaultAsync(cancellationToken);

            return ExtractSkillsFromText(parsedResumeText);
        }

        private static List<string> ReadSkills(string? skillsJson)
        {
            if (string.IsNullOrWhiteSpace(skillsJson))
            {
                return [];
            }

            try
            {
                return JsonSerializer.Deserialize<List<StoredSkill>>(skillsJson)?
                    .Select(skill => skill.Name)
                    .ToList() ?? [];
            }
            catch (JsonException)
            {
                return [];
            }
        }

        private static List<string> ExtractSkillsFromText(string? parsedText)
        {
            if (string.IsNullOrWhiteSpace(parsedText))
            {
                return [];
            }

            return WhitespaceRegex.Split(parsedText)
                .Select(word => word.Trim().Trim(',', '.', ';', ':', '(', ')', '[', ']', '{', '}'))
                .Where(word => !string.IsNullOrWhiteSpace(word))
                .ToList();
        }

        private static int CalculateMatchPercentage(List<string> jobSkills, List<string> studentSkills)
        {
            if (jobSkills.Count == 0 || studentSkills.Count == 0)
            {
                return 0;
            }

            var normalizedJobSkills = jobSkills.Select(skill => skill.ToLowerInvariant().Trim()).ToHashSet();
            var normalizedStudentSkills = studentSkills.Select(skill => skill.ToLowerInvariant().Trim()).ToHashSet();

            var matchedSkills = normalizedJobSkills.Intersect(normalizedStudentSkills).Count();

            return (int)Math.Round((double)matchedSkills / normalizedJobSkills.Count * 100);
        }

        private static List<string> SplitToBullets(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                return [];
            }

            var normalized = text.Replace("\r\n", "\n").Replace('\r', '\n');
            var newlineParts = normalized
                .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(part => !string.IsNullOrWhiteSpace(part))
                .ToList();

            if (newlineParts.Count >= 2)
            {
                return newlineParts;
            }

            return SentenceRegex
                .Split(WhitespaceRegex.Replace(text.Trim(), " "))
                .Select(sentence => sentence.Trim())
                .Where(sentence => !string.IsNullOrWhiteSpace(sentence))
                .Take(MaxBullets)
                .ToList();
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/board", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);
                return result.ToHttpResult();
            })
            .AllowAnonymous()
            .WithName(nameof(GetJobBoardJobs))
            .Produces<List<Response>>(StatusCodes.Status200OK);
}
