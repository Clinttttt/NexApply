using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.SavedJobs;

public static class GetSavedJobs
{
    public sealed record Query : IRequest<Result<List<Response>>>;

    public sealed class Response
    {
        public Guid SavedJobId { get; init; }
        public Guid JobListingId { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Company { get; init; } = string.Empty;
        public string Location { get; init; } = string.Empty;
        public string JobType { get; init; } = string.Empty;
        public string WorkSetup { get; init; } = string.Empty;
        public string Salary { get; init; } = string.Empty;
        public DateTime PostedAt { get; init; }
        public DateTime SavedAt { get; init; }
        public bool HasApplied { get; init; }
        public List<string> Skills { get; init; } = [];
        public string Description { get; init; } = string.Empty;
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<List<Response>>>
    {
        public async Task<Result<List<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var student = await context.StudentProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(profile => profile.UserId == userId, cancellationToken);

            if (student is null)
            {
                return Result<List<Response>>.NotFound("Student profile not found");
            }

            var savedJobs = await context.SavedJobs
                .AsNoTracking()
                .Where(saved => saved.StudentId == student.Id)
                .OrderByDescending(saved => saved.CreatedAt)
                .Select(saved => new Response
                {
                    SavedJobId = saved.Id,
                    JobListingId = saved.JobListingId,
                    Title = saved.JobListing.Title,
                    Company = saved.JobListing.Company.CompanyProfile != null
                        ? saved.JobListing.Company.CompanyProfile.CompanyName
                        : saved.JobListing.Company.Username,
                    Location = saved.JobListing.Location,
                    JobType = saved.JobListing.JobType.ToDisplayName(),
                    WorkSetup = saved.JobListing.WorkSetup.ToDisplayName(),
                    Salary = SalaryRange.Format(saved.JobListing.SalaryMin, saved.JobListing.SalaryMax),
                    PostedAt = saved.JobListing.CreatedAt,
                    SavedAt = saved.CreatedAt,
                    HasApplied = saved.JobListing.Applications.Any(application => application.StudentId == student.Id),
                    Skills = SkillMatchScorer.ParseSkills(saved.JobListing.RequiredSkills),
                    Description = saved.JobListing.Description
                })
                .ToListAsync(cancellationToken);

            return Result<List<Response>>.Success(savedJobs);
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetSavedJobs))
            .Produces<List<Response>>(StatusCodes.Status200OK);
}
