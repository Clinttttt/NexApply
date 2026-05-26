namespace NexApply.Api.Entities;

public class NotificationState : BaseEntity
{
    public Guid StudentId { get; private set; }
    public string NotificationId { get; private set; } = string.Empty;

    public bool IsRead { get; private set; }
    public bool IsDismissed { get; private set; }

    private NotificationState() { } // EF Core

    public static NotificationState Create(Guid studentId, string notificationId)
    {
        return new NotificationState
        {
            StudentId = studentId,
            NotificationId = notificationId,
            IsRead = false,
            IsDismissed = false
        };
    }

    public void MarkAsRead()
    {
        if (IsRead) return;
        IsRead = true;
        MarkAsUpdated();
    }

    public void Dismiss()
    {
        if (IsDismissed) return;
        IsDismissed = true;
        MarkAsUpdated();
    }
}

