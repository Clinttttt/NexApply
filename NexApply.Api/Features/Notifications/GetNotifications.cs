using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Notifications;

public static class GetNotifications
{
    public sealed record Query : IRequest<Result<List<NotificationResponse>>>;

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<List<NotificationResponse>>>
    {
        public async Task<Result<List<NotificationResponse>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var student = await context.StudentProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(profile => profile.UserId == userId, cancellationToken);

            if (student is null)
            {
                return Result<List<NotificationResponse>>.NotFound("Student profile not found");
            }

            var raw = await NotificationsBuilder.BuildAsync(context, student.Id, cancellationToken);

            if (raw.Count == 0)
            {
                return Result<List<NotificationResponse>>.Success([]);
            }

            var ids = raw.Select(notification => notification.Id).ToList();

            var states = await context.NotificationStates
                .AsNoTracking()
                .Where(state => state.StudentId == student.Id && ids.Contains(state.NotificationId))
                .ToListAsync(cancellationToken);

            var stateMap = states.ToDictionary(state => state.NotificationId, state => state, StringComparer.OrdinalIgnoreCase);

            var merged = raw
                .Where(notification => !stateMap.TryGetValue(notification.Id, out var state) || !state.IsDismissed)
                .Select(notification =>
                {
                    if (stateMap.TryGetValue(notification.Id, out var state))
                    {
                        notification.IsRead = state.IsRead;
                    }

                    return notification;
                })
                .ToList();

            return Result<List<NotificationResponse>>.Success(merged);
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetNotifications));
}
