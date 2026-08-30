namespace NexApply.Api.Features.Notifications;

public sealed class NotificationResponse
{
    public string Id { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Body { get; init; } = string.Empty;
    public string DetailBody { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public bool IsRead { get; set; }
    public string ActionLabel { get; init; } = string.Empty;
    public string PrimaryAction { get; init; } = string.Empty;
    public string SecondaryAction { get; init; } = string.Empty;
    public Dictionary<string, string> MetaItems { get; init; } = new();
}
