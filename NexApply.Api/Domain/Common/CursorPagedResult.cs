namespace NexApply.Api.Domain.Common;

public sealed class CursorPagedResult<T>
{
    public List<T> Items { get; set; } = [];
    public DateTime? NextCursor { get; set; }
    public bool HasMore { get; set; }
}
