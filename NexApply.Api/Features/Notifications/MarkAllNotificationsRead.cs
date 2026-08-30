using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Notifications;

public static class MarkAllNotificationsRead
{
    public sealed record Command : IRequest<Result<bool>>;

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Command, Result<bool>>
    {
        public async Task<Result<bool>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var student = await context.StudentProfiles
                .FirstOrDefaultAsync(profile => profile.UserId == userId, cancellationToken);

            if (student is null)
            {
                return Result<bool>.NotFound("Student profile not found");
            }

            var notifications = await NotificationsBuilder.BuildAsync(context, student.Id, cancellationToken);
            if (notifications.Count == 0)
            {
                return Result<bool>.Success(true);
            }

            var notificationIds = notifications.Select(notification => notification.Id).ToList();

            var existingStates = await context.NotificationStates
                .Where(state => state.StudentId == student.Id && notificationIds.Contains(state.NotificationId))
                .ToListAsync(cancellationToken);

            var stateMap = existingStates.ToDictionary(
                state => state.NotificationId,
                state => state,
                StringComparer.OrdinalIgnoreCase);

            foreach (var notificationId in notificationIds)
            {
                if (!stateMap.TryGetValue(notificationId, out var state))
                {
                    state = NotificationState.Create(student.Id, notificationId);
                    context.NotificationStates.Add(state);
                }

                state.MarkAsRead();
            }

            await context.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/read-all", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Command(), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(MarkAllNotificationsRead));
}
