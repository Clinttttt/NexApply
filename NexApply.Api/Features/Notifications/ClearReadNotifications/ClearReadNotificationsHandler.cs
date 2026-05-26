using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.Notifications;

namespace NexApply.Api.Features.Notifications.ClearReadNotifications;

public class ClearReadNotificationsHandler(AppDbContext context, CurrentUser currentUser)
    : IRequestHandler<ClearReadNotificationsCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(ClearReadNotificationsCommand request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);

        var student = await context.StudentProfiles
            .FirstOrDefaultAsync(profile => profile.UserId == userId, ct);

        if (student is null)
            return Result<bool>.NotFound("Student profile not found");

        var states = await context.NotificationStates
            .Where(s => s.StudentId == student.Id && s.IsRead && !s.IsDismissed)
            .ToListAsync(ct);

        foreach (var state in states)
            state.Dismiss();

        await context.SaveChangesAsync(ct);
        return Result<bool>.Success(true);
    }
}

