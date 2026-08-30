using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Interviews;

public static class ScheduleInterview
{
    private static readonly string[] AllowedFormats = ["VideoCall", "Video Call", "OnSite", "On-site", "Phone"];

    public sealed record Command(
        Guid? ApplicationId,
        Guid? StudentId,
        Guid? JobListingId,
        DateTime ScheduledAt,
        int DurationMinutes,
        string Format,
        string? Location,
        string? MeetingLink,
        string? Notes,
        List<string> InterviewerNames) : IRequest<Result<InterviewResponse>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.ApplicationId)
                .NotEmpty()
                .When(command => !command.StudentId.HasValue && !command.JobListingId.HasValue)
                .WithMessage("ApplicationId is required when StudentId and JobListingId are not provided");

            RuleFor(command => command.StudentId)
                .NotEmpty()
                .When(command => !command.ApplicationId.HasValue)
                .WithMessage("StudentId is required when ApplicationId is not provided");

            RuleFor(command => command.JobListingId)
                .NotEmpty()
                .When(command => !command.ApplicationId.HasValue)
                .WithMessage("JobListingId is required when ApplicationId is not provided");

            RuleFor(command => command.ScheduledAt)
                .NotEmpty()
                .WithMessage("Scheduled date and time is required")
                .GreaterThan(DateTime.UtcNow.AddMinutes(-5))
                .WithMessage("Interview must be scheduled in the future");

            RuleFor(command => command.DurationMinutes)
                .GreaterThan(0)
                .WithMessage("Duration must be greater than 0")
                .LessThanOrEqualTo(480)
                .WithMessage("Duration cannot exceed 8 hours");

            RuleFor(command => command.Format)
                .NotEmpty()
                .WithMessage("Interview format is required")
                .Must(format => AllowedFormats.Contains(format))
                .WithMessage("Invalid interview format. Must be VideoCall, OnSite, or Phone");

            RuleFor(command => command.Location)
                .MaximumLength(500)
                .WithMessage("Location cannot exceed 500 characters");

            RuleFor(command => command.MeetingLink)
                .MaximumLength(1000)
                .WithMessage("Meeting link cannot exceed 1000 characters");

            RuleFor(command => command.Notes)
                .MaximumLength(5000)
                .WithMessage("Notes cannot exceed 5000 characters");
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Command, Result<InterviewResponse>>
    {
        private const string UnknownCandidate = "Unknown";

        public async Task<Result<InterviewResponse>> Handle(Command request, CancellationToken cancellationToken)
        {
            var companyId = Guid.Parse(currentUser.UserId);

            var companyExists = await context.CompanyProfiles
                .AnyAsync(profile => profile.UserId == companyId, cancellationToken);

            if (!companyExists)
            {
                return Result<InterviewResponse>.NotFound();
            }

            if (!Enum.TryParse<InterviewFormat>(request.Format.Replace(" ", string.Empty), true, out var format))
            {
                return Result<InterviewResponse>.Failure("Invalid interview format");
            }

            Application application;
            StudentProfile student;
            JobListing jobListing;

            if (request.ApplicationId.HasValue)
            {
                var existing = await context.Applications
                    .Include(candidate => candidate.JobListing)
                    .Include(candidate => candidate.Student)
                    .FirstOrDefaultAsync(candidate => candidate.Id == request.ApplicationId.Value, cancellationToken);

                if (existing is null)
                {
                    return Result<InterviewResponse>.NotFound();
                }

                if (existing.JobListing.CompanyId != companyId)
                {
                    return Result<InterviewResponse>.Forbidden();
                }

                application = existing;
                student = existing.Student;
                jobListing = existing.JobListing;
                application.MoveToInterview();
            }
            else if (request.StudentId.HasValue && request.JobListingId.HasValue)
            {
                var existingStudent = await context.StudentProfiles
                    .FirstOrDefaultAsync(profile => profile.Id == request.StudentId.Value, cancellationToken);

                if (existingStudent is null)
                {
                    return Result<InterviewResponse>.NotFound();
                }

                var existingListing = await context.JobListings
                    .FirstOrDefaultAsync(listing => listing.Id == request.JobListingId.Value, cancellationToken);

                if (existingListing is null)
                {
                    return Result<InterviewResponse>.NotFound();
                }

                if (existingListing.CompanyId != companyId)
                {
                    return Result<InterviewResponse>.Forbidden();
                }

                student = existingStudent;
                jobListing = existingListing;

                application = Application.Create(existingStudent.Id, existingListing.Id, null, null);
                application.MoveToInterview();
                context.Applications.Add(application);
                await context.SaveChangesAsync(cancellationToken);
            }
            else
            {
                return Result<InterviewResponse>.Failure(
                    "Either ApplicationId or both StudentId and JobListingId must be provided");
            }

            var interview = Interview.Create(
                application.Id,
                request.ScheduledAt,
                request.DurationMinutes,
                format,
                request.Location,
                request.MeetingLink,
                request.Notes);

            context.Interviews.Add(interview);
            await context.SaveChangesAsync(cancellationToken);

            var interviewerNames = request.InterviewerNames
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Select(name => name.Trim())
                .ToList();

            foreach (var name in interviewerNames)
            {
                context.InterviewPanelists.Add(InterviewPanelist.Create(interview.Id, name, null, null));
            }

            context.Messages.Add(Message.CreateInterviewInvite(
                companyId,
                student.UserId,
                $"You are invited to interview for {jobListing.Title}.",
                interview.Id));

            await context.SaveChangesAsync(cancellationToken);

            return Result<InterviewResponse>.Success(new InterviewResponse
            {
                Id = interview.Id,
                CandidateName = student.FullName ?? UnknownCandidate,
                JobTitle = jobListing.Title,
                ScheduledAt = interview.ScheduledAt,
                DurationMinutes = interview.DurationMinutes,
                Format = interview.Format.ToString(),
                Status = interview.Status.ToString(),
                Location = interview.Location,
                MeetingLink = interview.MeetingLink,
                Interviewers = interviewerNames,
                Notes = interview.Notes
            });
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(ScheduleInterview))
            .Produces<InterviewResponse>(StatusCodes.Status200OK);
}
