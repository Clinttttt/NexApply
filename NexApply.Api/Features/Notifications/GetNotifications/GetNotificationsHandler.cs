using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.Notifications;

namespace NexApply.Api.Features.Notifications.GetNotifications;

public class GetNotificationsHandler(AppDbContext context, CurrentUser currentUser)
    : IRequestHandler<GetNotificationsQuery, Result<List<NotificationDto>>>
{
    public async Task<Result<List<NotificationDto>>> Handle(GetNotificationsQuery request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);

        var student = await context.StudentProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(profile => profile.UserId == userId, ct);

        if (student is null)
            return Result<List<NotificationDto>>.NotFound("Student profile not found");

        var raw = await NotificationsBuilder.BuildAsync(context, student.Id, ct);
        if (raw.Count == 0)
            return Result<List<NotificationDto>>.Success([]);

        var ids = raw.Select(n => n.Id).ToList();

        var states = await context.NotificationStates
            .AsNoTracking()
            .Where(s => s.StudentId == student.Id && ids.Contains(s.NotificationId))
            .ToListAsync(ct);

        var stateMap = states.ToDictionary(s => s.NotificationId, s => s, StringComparer.OrdinalIgnoreCase);

        var merged = raw
            .Where(n =>
            {
                return !stateMap.TryGetValue(n.Id, out var st) || !st.IsDismissed;
            })
            .Select(n =>
            {
                if (stateMap.TryGetValue(n.Id, out var st))
                    n.IsRead = st.IsRead;
                return n;
            })
            .ToList();

        return Result<List<NotificationDto>>.Success(merged);
    }
}

