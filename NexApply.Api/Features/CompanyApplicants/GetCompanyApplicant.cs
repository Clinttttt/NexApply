using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.CompanyApplicants;

public static class GetCompanyApplicant
{
    public sealed record Query(Guid ApplicationId) : IRequest<Result<ApplicantResponse>>;

    public sealed class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(query => query.ApplicationId).NotEmpty();
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<ApplicantResponse>>
    {
        public async Task<Result<ApplicantResponse>> Handle(Query request, CancellationToken cancellationToken)
        {
            var companyId = Guid.Parse(currentUser.UserId);

            var application = await context.Applications
                .AsNoTracking()
                .Include(candidate => candidate.Student)
                    .ThenInclude(student => student.Resume)
                .Include(candidate => candidate.Student)
                    .ThenInclude(student => student.User)
                .Include(candidate => candidate.JobListing)
                .FirstOrDefaultAsync(
                    candidate => candidate.Id == request.ApplicationId
                        && candidate.JobListing.CompanyId == companyId,
                    cancellationToken);

            if (application is null)
            {
                return Result<ApplicantResponse>.NotFound();
            }

            return Result<ApplicantResponse>.Success(new ApplicantResponse
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
                MatchScore = SkillMatchScorer.CalculateMatchScore(
                    application.JobListing.RequiredSkills,
                    application.Student),
                AppliedAt = application.CreatedAt,
                CoverLetter = application.CoverLetter,
                RecruiterNotes = application.RecruiterNotes,
                Skills = SkillMatchScorer.GetSkillsFromJson(application.Student.Resume?.SkillsJson)
            });
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/{applicationId:guid}", async (
                Guid applicationId,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(applicationId), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetCompanyApplicant));
}
