using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Contracts.Common;
using NexApply.Contracts.Notifications;

namespace NexApply.Api.Features.Notifications.MarkAllNotificationsRead;

public class MarkAllNotificationsReadHandler(AppDbContext context, CurrentUser currentUser)
    : IRequestHandler<MarkAllNotificationsReadCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(MarkAllNotificationsReadCommand request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);

        var student = await context.StudentProfiles
            .FirstOrDefaultAsync(profile => profile.UserId == userId, ct);

        if (student is null)
            return Result<bool>.NotFound("Student profile not found");

        var notifications = await NotificationsBuilder.BuildAsync(context, student.Id, ct);
        if (notifications.Count == 0)
            return Result<bool>.Success(true);

        var ids = notifications.Select(n => n.Id).ToList();

        var existing = await context.NotificationStates
            .Where(s => s.StudentId == student.Id && ids.Contains(s.NotificationId))
            .ToListAsync(ct);

        var existingMap = existing.ToDictionary(s => s.NotificationId, s => s, StringComparer.OrdinalIgnoreCase);

        foreach (var id in ids)
        {
            if (!existingMap.TryGetValue(id, out var state))
            {
                state = NotificationState.Create(student.Id, id);
                context.NotificationStates.Add(state);
            }

            state.MarkAsRead();
        }

        await context.SaveChangesAsync(ct);
        return Result<bool>.Success(true);
    }
}

