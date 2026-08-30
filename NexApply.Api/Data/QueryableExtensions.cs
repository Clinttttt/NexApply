using Microsoft.EntityFrameworkCore;
using NexApply.Api.Domain.Common;

namespace NexApply.Api.Data;

public static class QueryableExtensions
{
    public static async Task<CursorPagedResult<T>> ToCursorPagedResultAsync<T>(
        this IQueryable<T> query,
        int pageSize,
        Func<T, DateTime?> cursorSelector,
        CancellationToken cancellationToken)
    {
        var items = await query.Take(pageSize + 1).ToListAsync(cancellationToken);

        var hasMore = items.Count > pageSize;
        if (hasMore)
        {
            items.RemoveAt(items.Count - 1);
        }

        return new CursorPagedResult<T>
        {
            Items = items.Take(pageSize).ToList(),
            NextCursor = hasMore ? cursorSelector(items[^1]) : null,
            HasMore = hasMore
        };
    }
}
