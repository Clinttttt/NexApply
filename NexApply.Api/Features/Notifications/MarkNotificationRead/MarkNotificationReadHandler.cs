using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Contracts.Common;
using NexApply.Contracts.Notifications;

namespace NexApply.Api.Features.Notifications.MarkNotificationRead;

public class MarkNotificationReadHandler(AppDbContext context, CurrentUser currentUser)
    : IRequestHandler<MarkNotificationReadCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(MarkNotificationReadCommand request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);

        var student = await context.StudentProfiles
            .FirstOrDefaultAsync(profile => profile.UserId == userId, ct);

        if (student is null)
            return Result<bool>.NotFound("Student profile not found");

        var state = await context.NotificationStates
            .FirstOrDefaultAsync(s => s.StudentId == student.Id && s.NotificationId == request.NotificationId, ct);

        if (state is null)
        {
            state = NotificationState.Create(student.Id, request.NotificationId);
            context.NotificationStates.Add(state);
        }

        state.MarkAsRead();
        await context.SaveChangesAsync(ct);

        return Result<bool>.Success(true);
    }
}

