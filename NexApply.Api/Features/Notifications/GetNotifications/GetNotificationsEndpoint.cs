using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.Notifications;

namespace NexApply.Api.Features.Notifications.GetNotifications;

public static class GetNotificationsEndpoint
{
    public static void MapGetNotifications(this WebApplication app)
    {
        app.MapGet("/api/notifications", [Authorize(Roles = "Student")] async (IMediator mediator) =>
            {
                var result = await mediator.Send(new GetNotificationsQuery());
                return ResultExtensions.ToIResult(result);
            })
            .WithTags("Student");
    }
}

