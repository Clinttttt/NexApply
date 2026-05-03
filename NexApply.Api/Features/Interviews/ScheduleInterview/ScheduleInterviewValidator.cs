using FluentValidation;
using NexApply.Contracts.Interviews;

namespace NexApply.Api.Features.Interviews.ScheduleInterview;

public class ScheduleInterviewValidator : AbstractValidator<ScheduleInterviewCommand>
{
    public ScheduleInterviewValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty()
            .When(x => !x.StudentId.HasValue && !x.JobListingId.HasValue)
            .WithMessage("ApplicationId is required when StudentId and JobListingId are not provided");

        RuleFor(x => x.StudentId)
            .NotEmpty()
            .When(x => !x.ApplicationId.HasValue)
            .WithMessage("StudentId is required when ApplicationId is not provided");

        RuleFor(x => x.JobListingId)
            .NotEmpty()
            .When(x => !x.ApplicationId.HasValue)
            .WithMessage("JobListingId is required when ApplicationId is not provided");

        RuleFor(x => x.ScheduledAt)
            .NotEmpty()
            .WithMessage("Scheduled date and time is required")
            .GreaterThan(DateTime.UtcNow.AddMinutes(-5))
            .WithMessage("Interview must be scheduled in the future");

        RuleFor(x => x.DurationMinutes)
            .GreaterThan(0)
            .WithMessage("Duration must be greater than 0")
            .LessThanOrEqualTo(480)
            .WithMessage("Duration cannot exceed 8 hours");

        RuleFor(x => x.Format)
            .NotEmpty()
            .WithMessage("Interview format is required")
            .Must(f => new[] { "VideoCall", "Video Call", "OnSite", "On-site", "Phone" }.Contains(f))
            .WithMessage("Invalid interview format. Must be VideoCall, OnSite, or Phone");

        RuleFor(x => x.Location)
            .MaximumLength(500)
            .WithMessage("Location cannot exceed 500 characters");

        RuleFor(x => x.MeetingLink)
            .MaximumLength(1000)
            .WithMessage("Meeting link cannot exceed 1000 characters");

        RuleFor(x => x.Notes)
            .MaximumLength(5000)
            .WithMessage("Notes cannot exceed 5000 characters");
    }
}
