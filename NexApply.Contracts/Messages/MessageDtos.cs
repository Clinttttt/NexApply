namespace NexApply.Contracts.Messages;

public class ConversationDto
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public bool IsOnline { get; set; }
    public bool LastSenderIsMe { get; set; }
    public string LastMessage { get; set; } = string.Empty;
    public DateTime LastMessageAt { get; set; }
    public string? ApplicationStage { get; set; }
    public int MatchScore { get; set; }
    public Guid? ApplicantId { get; set; }
    public DateTime? AppliedDate { get; set; }
    public List<string>? Skills { get; set; }
}

public class MessageDto
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public string Type { get; set; } = string.Empty;
    public InterviewInviteDetailsDto? InviteDetails { get; set; }
}

public class InterviewInviteDetailsDto
{
    public string Position { get; set; } = string.Empty;
    public string DateDisplay { get; set; } = string.Empty;
    public string TimeDisplay { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
}
