using System.Text.RegularExpressions;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.JobListings;

public static class GetStudentBrowseJobs
{
    private const int DefaultPageSize = 10;

    public sealed record Query(DateTime? Cursor = null, int PageSize = DefaultPageSize)
        : IRequest<Result<CursorPagedResult<Response>>>;

    public sealed class Response
    {
        public Guid Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Company { get; init; } = string.Empty;
        public string JobType { get; init; } = string.Empty;
        public string WorkSetup { get; init; } = string.Empty;
        public string Location { get; init; } = string.Empty;
        public int MatchScore { get; init; }
        public DateTime PostedAt { get; init; }
        public int Applicants { get; init; }
        public string Salary { get; init; } = string.Empty;
        public string LogoText { get; init; } = string.Empty;
        public bool IsSaved { get; init; }
        public bool HasApplied { get; init; }
        public List<string> MatchedSkills { get; init; } = [];
        public List<string> MissingSkills { get; init; } = [];
        public List<string> Description { get; init; } = [];
        public List<string> Responsibilities { get; init; } = [];
        public List<string> Requirements { get; init; } = [];
    }

    public sealed class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(query => query.PageSize)
                .InclusiveBetween(1, 50)
                .WithMessage("PageSize must be between 1 and 50");
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<CursorPagedResult<Response>>>
    {
        private const string DefaultLogoText = "NA";

        private static readonly Regex SentenceRegex = new(@"(?<=[.!?])\s+", RegexOptions.Compiled);

        public async Task<Result<CursorPagedResult<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var student = await context.StudentProfiles
                .AsNoTracking()
                .Include(profile => profile.Resume)
                .FirstOrDefaultAsync(profile => profile.UserId == userId, cancellationToken);

            if (student is null)
            {
                return Result<CursorPagedResult<Response>>.NotFound("Student profile not found");
            }

            var resumeSkills = SkillMatchScorer.GetResumeSkills(student);
            var searchableResumeText = SkillMatchScorer.BuildSearchableResumeText(student, resumeSkills);

            var jobsQuery = context.JobListings
                .AsNoTracking()
                .Include(listing => listing.Company)
                    .ThenInclude(company => company.CompanyProfile)
                .Include(listing => listing.Applications)
                .Include(listing => listing.SavedByStudents)
                .Where(listing => listing.Status == JobListingStatus.Active);

            if (request.Cursor.HasValue)
            {
                jobsQuery = jobsQuery.Where(listing => listing.CreatedAt < request.Cursor.Value);
            }

            var pagedJobs = await jobsQuery
                .OrderByDescending(listing => listing.CreatedAt)
                .ToCursorPagedResultAsync(request.PageSize, job => job.CreatedAt, cancellationToken);

            var items = pagedJobs.Items
                .Select(job => BuildResponse(job, student.Id, resumeSkills, searchableResumeText))
                .ToList();

            return Result<CursorPagedResult<Response>>.Success(new CursorPagedResult<Response>
            {
                Items = items,
                NextCursor = pagedJobs.NextCursor,
                HasMore = pagedJobs.HasMore
            });
        }

        private static Response BuildResponse(
            JobListing job,
            Guid studentId,
            List<string> resumeSkills,
            string searchableResumeText)
        {
            var requiredSkills = SkillMatchScorer.ParseSkills(job.RequiredSkills);

            var matchedSkills = requiredSkills
                .Where(skill => SkillMatchScorer.IsSkillMatched(skill, resumeSkills, searchableResumeText))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var missingSkills = requiredSkills
                .Where(skill => !matchedSkills.Contains(skill, StringComparer.OrdinalIgnoreCase))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var companyName = job.Company.CompanyProfile?.CompanyName ?? job.Company.Username;

            return new Response
            {
                Id = job.Id,
                Title = job.Title,
                Company = companyName,
                JobType = job.JobType.ToDisplayName(),
                WorkSetup = job.WorkSetup.ToDisplayName(),
                Location = job.Location,
                MatchScore = CalculateMatchScore(requiredSkills.Count, matchedSkills.Count),
                PostedAt = job.CreatedAt,
                Applicants = job.Applications.Count,
                Salary = SalaryRange.Format(job.SalaryMin, job.SalaryMax),
                LogoText = BuildLogoText(companyName),
                IsSaved = job.SavedByStudents.Any(saved => saved.StudentId == studentId),
                HasApplied = job.Applications.Any(application => application.StudentId == studentId),
                MatchedSkills = matchedSkills,
                MissingSkills = missingSkills,
                Description = SplitIntoSentences(job.Description),
                Responsibilities = SplitIntoSentences(job.Responsibilities),
                Requirements = SplitIntoSentences(job.Qualifications)
            };
        }

        private static int CalculateMatchScore(int requiredSkillCount, int matchedSkillCount) =>
            requiredSkillCount == 0
                ? 0
                : (int)Math.Round((double)matchedSkillCount / requiredSkillCount * 100, MidpointRounding.AwayFromZero);

        private static string BuildLogoText(string companyName)
        {
            var initials = companyName
                .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Take(2)
                .Select(word => char.ToUpperInvariant(word[0]));

            var logoText = string.Concat(initials);

            return string.IsNullOrWhiteSpace(logoText) ? DefaultLogoText : logoText;
        }

        private static List<string> SplitIntoSentences(string text) =>
            SentenceRegex
                .Split(text.Trim())
                .Select(sentence => sentence.Trim())
                .Where(sentence => !string.IsNullOrWhiteSpace(sentence))
                .ToList();
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/browse", async (
                [FromQuery] DateTime? cursor,
                [FromQuery] int? pageSize,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var query = new Query(cursor, pageSize ?? DefaultPageSize);
                var result = await sender.Send(query, cancellationToken);

                return result.ToHttpResult();
            })
            .RequireAuthorization(policy => policy.RequireRole("Student"))
            .WithName(nameof(GetStudentBrowseJobs))
            .Produces<CursorPagedResult<Response>>(StatusCodes.Status200OK);
}
