using System.Text.Json;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.CompanyApplicants;

public static class GetApplicantResumeContent
{
    public sealed record Query(Guid ApplicationId) : IRequest<Result<Response>>;

    public sealed class Response
    {
        public string? FullName { get; init; }
        public string? Phone { get; init; }
        public string? Email { get; init; }
        public string? Location { get; init; }
        public string? Headline { get; init; }
        public string? AboutMe { get; init; }
        public List<Education> Education { get; init; } = [];
        public List<WorkExperience> WorkExperience { get; init; } = [];
        public List<string> Skills { get; init; } = [];
    }

    public sealed class Education
    {
        public string Institution { get; init; } = string.Empty;
        public string Degree { get; init; } = string.Empty;
        public int? StartYear { get; init; }
        public int? EndYear { get; init; }
        public string? Description { get; init; }
    }

    public sealed class WorkExperience
    {
        public string Company { get; init; } = string.Empty;
        public string Position { get; init; } = string.Empty;
        public DateTime? StartDate { get; init; }
        public DateTime? EndDate { get; init; }
        public string? Description { get; init; }
    }

    public sealed class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(query => query.ApplicationId).NotEmpty();
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<Response>>
    {
        private sealed record StoredEntry(string Organization, string Period, string Title, string Description);

        public async Task<Result<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            var companyId = Guid.Parse(currentUser.UserId);

            var application = await context.Applications
                .AsNoTracking()
                .Include(candidate => candidate.Student)
                    .ThenInclude(student => student.User)
                .Include(candidate => candidate.Student)
                    .ThenInclude(student => student.Resume)
                .Include(candidate => candidate.JobListing)
                .FirstOrDefaultAsync(
                    candidate => candidate.Id == request.ApplicationId
                        && candidate.JobListing.CompanyId == companyId,
                    cancellationToken);

            if (application is null)
            {
                return Result<Response>.NotFound();
            }

            var student = application.Student;
            var resume = student.Resume;

            if (resume is null)
            {
                return Result<Response>.Success(new Response
                {
                    FullName = student.FullName,
                    Phone = student.Phone,
                    Email = student.User.Email,
                    Location = student.Location
                });
            }

            return Result<Response>.Success(new Response
            {
                FullName = student.FullName,
                Phone = student.Phone,
                Email = student.User.Email,
                Location = student.Location,
                Headline = resume.Headline,
                AboutMe = resume.AboutMe,
                Education = Deserialize(resume.EducationJson)
                    .Select(entry => new Education
                    {
                        Institution = entry.Organization,
                        Degree = entry.Title,
                        StartYear = ParseYear(entry.Period, true),
                        EndYear = ParseYear(entry.Period, false),
                        Description = entry.Description
                    })
                    .ToList(),
                WorkExperience = Deserialize(resume.WorkExperienceJson)
                    .Select(entry => new WorkExperience
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
        group.MapGet("/{applicationId:guid}/resume/content", async (
                Guid applicationId,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(applicationId), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetApplicantResumeContent))
            .Produces<Response>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);
}
