namespace NexApply.Api.Features.Interviews;

public sealed class InterviewResponse
{
    public Guid Id { get; init; }
    public string CandidateName { get; init; } = string.Empty;
    public string JobTitle { get; init; } = string.Empty;
    public DateTime ScheduledAt { get; init; }
    public int DurationMinutes { get; init; }
    public string Format { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string? Location { get; init; }
    public string? MeetingLink { get; init; }
    public List<string> Interviewers { get; init; } = [];
    public string? Notes { get; init; }
    public string? Feedback { get; init; }
    public int? Rating { get; init; }
    public string? Recommendation { get; init; }
}
