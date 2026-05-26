namespace NexApply.Contracts.Notifications;

public class NotificationDto
{
    // Stable key for the notification (URL-safe when encoded).
    public string Id { get; set; } = string.Empty;

    // "Application" | "Match" | "System" | "Saved"
    public string Category { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string DetailBody { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }

    public string ActionLabel { get; set; } = string.Empty;
    public string PrimaryAction { get; set; } = string.Empty;
    public string SecondaryAction { get; set; } = string.Empty;

    public Dictionary<string, string> MetaItems { get; set; } = new();
}

