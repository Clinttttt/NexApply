using Microsoft.EntityFrameworkCore;
using NexApply.Common;
namespace NexApply.Api.Common
{
    public static class PaginationExtensions
    {
        public static async Task<CursorPagedResult<T>> ToCursorPagedResultAsync<T>(this IQueryable<T> query, int page_size, Func<T, DateTime?> cursorSelector, CancellationToken cancellationToken)
        {
            var items = await query.Take(page_size + 1).ToListAsync(cancellationToken);
            var hasMore = items.Count > page_size;
            if (hasMore) items.RemoveAt(items.Count - 1);
            var nextCursor = hasMore ? cursorSelector(items.Last()) : null;
            return new CursorPagedResult<T>
            {
                Items = items.Take(page_size).ToList(),
                NextCursor = nextCursor,
                HasMore = hasMore
            };

        }
    }
}

