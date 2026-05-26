using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Contracts.Common;
using NexApply.Contracts.Notifications;

namespace NexApply.Api.Features.Notifications.DismissNotification;

public class DismissNotificationHandler(AppDbContext context, CurrentUser currentUser)
    : IRequestHandler<DismissNotificationCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(DismissNotificationCommand request, CancellationToken ct)
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

        state.Dismiss();
        await context.SaveChangesAsync(ct);

        return Result<bool>.Success(true);
    }
}

