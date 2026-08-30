using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Applications;

public static class Apply
{
    public sealed record Command(
        Guid JobListingId,
        string? CoverLetter = null,
        string? ResumeUrl = null) : IRequest<Result<Response>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.JobListingId)
                .NotEmpty();

            RuleFor(command => command.CoverLetter)
                .MaximumLength(4000)
                .When(command => !string.IsNullOrWhiteSpace(command.CoverLetter));

            RuleFor(command => command.ResumeUrl)
                .MaximumLength(1000)
                .When(command => !string.IsNullOrWhiteSpace(command.ResumeUrl));
        }
    }

    public sealed class Response
    {
        public Guid ApplicationId { get; init; }
        public Guid JobListingId { get; init; }
        public string Status { get; init; } = string.Empty;
        public DateTime AppliedAt { get; init; }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Command, Result<Response>>
    {
        public async Task<Result<Response>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var student = await context.StudentProfiles
                .FirstOrDefaultAsync(profile => profile.UserId == userId, cancellationToken);

            if (student is null)
            {
                return Result<Response>.NotFound("Student profile not found");
            }

            var jobListing = await context.JobListings
                .FirstOrDefaultAsync(job => job.Id == request.JobListingId, cancellationToken);

            if (jobListing is null)
            {
                return Result<Response>.NotFound("Job listing not found");
            }

            if (jobListing.Status != JobListingStatus.Active)
            {
                return Result<Response>.Failure("This job is no longer accepting applications");
            }

            var alreadyApplied = await context.Applications
                .AnyAsync(
                    application => application.StudentId == student.Id
                        && application.JobListingId == request.JobListingId,
                    cancellationToken);

            if (alreadyApplied)
            {
                return Result<Response>.Conflict("You have already applied to this job");
            }

            var application = Application.Create(
                student.Id,
                request.JobListingId,
                request.CoverLetter,
                request.ResumeUrl);

            context.Applications.Add(application);
            await context.SaveChangesAsync(cancellationToken);

            return Result<Response>.Success(new Response
            {
                ApplicationId = application.Id,
                JobListingId = application.JobListingId,
                Status = application.Status.ToString(),
                AppliedAt = application.CreatedAt
            });
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(Apply));
}
