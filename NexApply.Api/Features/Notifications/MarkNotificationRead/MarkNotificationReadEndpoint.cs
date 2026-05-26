using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.Notifications;

namespace NexApply.Api.Features.Notifications.MarkNotificationRead;

public static class MarkNotificationReadEndpoint
{
    public static void MapMarkNotificationRead(this WebApplication app)
    {
        app.MapPost("/api/notifications/{notificationId}/read",
                [Authorize(Roles = "Student")] async (string notificationId, IMediator mediator) =>
                {
                    var result = await mediator.Send(new MarkNotificationReadCommand(notificationId));
                    return ResultExtensions.ToIResult(result);
                })
            .WithTags("Student");
    }
}

