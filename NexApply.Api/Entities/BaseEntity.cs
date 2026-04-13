namespace NexApply.Api.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; private set; }

    protected void MarkAsUpdated() => UpdatedAt = DateTime.UtcNow;
}
