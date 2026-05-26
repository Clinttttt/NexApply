using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.Notifications;

namespace NexApply.Api.Features.Notifications.DismissNotification;

public static class DismissNotificationEndpoint
{
    public static void MapDismissNotification(this WebApplication app)
    {
        app.MapDelete("/api/notifications/{notificationId}",
                [Authorize(Roles = "Student")] async (string notificationId, IMediator mediator) =>
                {
                    var result = await mediator.Send(new DismissNotificationCommand(notificationId));
                    return ResultExtensions.ToIResult(result);
                })
            .WithTags("Student");
    }
}

