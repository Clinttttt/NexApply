using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.Notifications;

namespace NexApply.Api.Features.Notifications.ClearReadNotifications;

public static class ClearReadNotificationsEndpoint
{
    public static void MapClearReadNotifications(this WebApplication app)
    {
        app.MapPost("/api/notifications/clear-read",
                [Authorize(Roles = "Student")] async (IMediator mediator) =>
                {
                    var result = await mediator.Send(new ClearReadNotificationsCommand());
                    return ResultExtensions.ToIResult(result);
                })
            .WithTags("Student");
    }
}

