using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Interviews;

public record ScheduleInterviewCommand(
    Guid? ApplicationId,
    Guid? StudentId,
    Guid? JobListingId,
    DateTime ScheduledAt,
    int DurationMinutes,
    string Format,
    string? Location,
    string? MeetingLink,
    string? Notes,
    List<string> InterviewerNames
) : IRequest<Result<InterviewDto>>;
