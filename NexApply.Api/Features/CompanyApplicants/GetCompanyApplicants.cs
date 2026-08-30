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

namespace NexApply.Api.Features.CompanyApplicants;

public static class GetCompanyApplicants
{
    public sealed record Query(
        string? Status = null,
        string? JobListingId = null,
        string? SearchTerm = null,
        string? SortBy = "Newest"
    ) : IRequest<Result<List<ApplicantResponse>>>;

    public sealed class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(query => query.SortBy)
                .Must(sortBy => string.IsNullOrWhiteSpace(sortBy) || new[] { "Newest", "Oldest", "NameAsc", "BestMatch" }.Contains(sortBy))
                .WithMessage("SortBy must be one of: Newest, Oldest, NameAsc, BestMatch");
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<List<ApplicantResponse>>>
    {
        public async Task<Result<List<ApplicantResponse>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var companyId = Guid.Parse(currentUser.UserId);

            var query = context.Applications
                .AsNoTracking()
                .Include(application => application.Student)
                    .ThenInclude(student => student.Resume)
                .Include(application => application.Student)
                    .ThenInclude(student => student.User)
                .Include(application => application.JobListing)
                .Where(application => application.JobListing.CompanyId == companyId);

            if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<ApplicationStatus>(request.Status, out var status))
            {
                query = query.Where(application => application.Status == status);
            }

            if (!string.IsNullOrWhiteSpace(request.JobListingId) && Guid.TryParse(request.JobListingId, out var jobId))
            {
                query = query.Where(application => application.JobListingId == jobId);
            }

            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchLower = request.SearchTerm.ToLower();
                query = query.Where(application =>
                    application.Student.FullName.ToLower().Contains(searchLower) ||
                    application.JobListing.Title.ToLower().Contains(searchLower) ||
                    (application.Student.ParsedResumeText != null && application.Student.ParsedResumeText.ToLower().Contains(searchLower))
                );
            }

            query = request.SortBy switch
            {
                "Oldest" => query.OrderBy(application => application.CreatedAt),
                "NameAsc" => query.OrderBy(application => application.Student.FullName),
                "BestMatch" => query.OrderByDescending(application => application.CreatedAt),
                _ => query.OrderByDescending(application => application.CreatedAt)
            };

            var applications = await query.ToListAsync(cancellationToken);

            var applicants = applications
                .Select(application => new ApplicantResponse
                {
                    ApplicationId = application.Id,
                    StudentId = application.StudentId,
                    StudentName = application.Student.FullName,
                    Email = application.Student.User.Email,
                    Phone = application.Student.Phone,
                    Location = application.Student.Location,
                    Portfolio = application.Student.Portfolio,
                    LinkedIn = application.Student.LinkedIn,
                    GitHub = application.Student.GitHub,
                    ResumeUrl = application.ResumeUrl,
                    JobListingId = application.JobListingId,
                    JobTitle = application.JobListing.Title,
                    JobType = application.JobListing.JobType.ToString(),
                    Status = application.Status.ToString(),
                    MatchScore = SkillMatchScorer.CalculateMatchScore(application.JobListing.RequiredSkills, application.Student),
                    AppliedAt = application.CreatedAt,
                    CoverLetter = application.CoverLetter,
                    RecruiterNotes = application.RecruiterNotes,
                    Skills = SkillMatchScorer.GetSkillsFromJson(application.Student.Resume?.SkillsJson)
                })
                .ToList();

            return Result<List<ApplicantResponse>>.Success(applicants);
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/", async (
                [FromQuery] string? status,
                [FromQuery] string? jobListingId,
                [FromQuery] string? searchTerm,
                [FromQuery] string? sortBy,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(status, jobListingId, searchTerm, sortBy), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetCompanyApplicants));
}
