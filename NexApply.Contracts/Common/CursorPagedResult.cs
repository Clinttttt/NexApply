namespace NexApply.Common;

public class CursorPagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public DateTime? NextCursor { get; set; }
    public bool HasMore { get; set; }
}

