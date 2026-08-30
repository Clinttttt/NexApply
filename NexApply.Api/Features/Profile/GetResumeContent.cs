using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Profile;

public static class GetResumeContent
{
    public sealed record Query : IRequest<Result<ResumeContent>>;

    private sealed record StoredEntry(string Organization, string Period, string Title, string Description);

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<ResumeContent>>
    {
        public async Task<Result<ResumeContent>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var profile = await context.StudentProfiles
                .AsNoTracking()
                .Include(candidate => candidate.User)
                .FirstOrDefaultAsync(candidate => candidate.UserId == userId, cancellationToken);

            if (profile is null)
            {
                return Result<ResumeContent>.NotFound("Profile not found");
            }

            var resume = await context.Resumes
                .AsNoTracking()
                .FirstOrDefaultAsync(candidate => candidate.StudentProfileId == profile.Id, cancellationToken);

            if (resume is null)
            {
                return Result<ResumeContent>.Success(new ResumeContent
                {
                    FullName = profile.FullName,
                    Phone = profile.Phone,
                    Email = profile.User.Email,
                    Location = profile.Location
                });
            }

            var storedEducation = Deserialize(resume.EducationJson);
            var storedWorkExperience = Deserialize(resume.WorkExperienceJson);

            return Result<ResumeContent>.Success(new ResumeContent
            {
                FullName = profile.FullName,
                Phone = profile.Phone,
                Email = profile.User.Email,
                Location = profile.Location,
                Headline = resume.Headline,
                AboutMe = resume.AboutMe,
                Education = storedEducation
                    .Select(entry => new ResumeEducation
                    {
                        Institution = entry.Organization,
                        Degree = entry.Title,
                        StartYear = ParseYear(entry.Period, true),
                        EndYear = ParseYear(entry.Period, false),
                        Description = entry.Description
                    })
                    .ToList(),
                WorkExperience = storedWorkExperience
                    .Select(entry => new ResumeWorkExperience
                    {
                        Company = entry.Organization,
                        Position = entry.Title,
                        StartDate = ParseDate(entry.Period, true),
                        EndDate = ParseDate(entry.Period, false),
                        Description = entry.Description
                    })
                    .ToList(),
                Skills = JsonSerializer.Deserialize<List<string>>(resume.SkillsJson) ?? []
            });
        }

        private static List<StoredEntry> Deserialize(string json) =>
            JsonSerializer.Deserialize<List<StoredEntry>>(json) ?? [];

        private static int? ParseYear(string period, bool isStart)
        {
            var value = SplitPeriod(period, isStart);

            return value is not null && int.TryParse(value, out var year) ? year : null;
        }

        private static DateTime? ParseDate(string period, bool isStart)
        {
            var value = SplitPeriod(period, isStart);
            if (value is null)
            {
                return null;
            }

            if (DateTime.TryParse(value, out var date))
            {
                return date;
            }

            if (int.TryParse(value, out var year))
            {
                return isStart ? new DateTime(year, 1, 1) : new DateTime(year, 12, 31);
            }

            return null;
        }

        private static string? SplitPeriod(string period, bool isStart)
        {
            if (string.IsNullOrWhiteSpace(period))
            {
                return null;
            }

            var parts = period.Split(['-', '\u2013'], StringSplitOptions.TrimEntries);
            if (parts.Length == 0)
            {
                return null;
            }

            var value = isStart ? parts[0] : parts.Length > 1 ? parts[1] : null;

            return value is null || value.Contains("Present", StringComparison.OrdinalIgnoreCase) ? null : value;
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/resume/content", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetResumeContent))
            .Produces<ResumeContent>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);
}
