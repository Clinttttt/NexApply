using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.Notifications;

namespace NexApply.Api.Features.Notifications.MarkAllNotificationsRead;

public static class MarkAllNotificationsReadEndpoint
{
    public static void MapMarkAllNotificationsRead(this WebApplication app)
    {
        app.MapPost("/api/notifications/read-all",
                [Authorize(Roles = "Student")] async (IMediator mediator) =>
                {
                    var result = await mediator.Send(new MarkAllNotificationsReadCommand());
                    return ResultExtensions.ToIResult(result);
                })
            .WithTags("Student");
    }
}

