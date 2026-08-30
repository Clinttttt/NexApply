namespace NexApply.Api.Features.Messages;

public sealed class MessageResponse
{
    public Guid Id { get; init; }
    public Guid SenderId { get; init; }
    public string Content { get; init; } = string.Empty;
    public DateTime SentAt { get; init; }
    public string Type { get; init; } = string.Empty;
    public InterviewInviteDetails? InviteDetails { get; init; }
}

public sealed class InterviewInviteDetails
{
    public string Position { get; init; } = string.Empty;
    public string DateDisplay { get; init; } = string.Empty;
    public string TimeDisplay { get; init; } = string.Empty;
    public string Format { get; init; } = string.Empty;
}
