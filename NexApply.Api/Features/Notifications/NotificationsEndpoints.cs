using NexApply.Api.Features.Notifications.ClearReadNotifications;
using NexApply.Api.Features.Notifications.DismissNotification;
using NexApply.Api.Features.Notifications.GetNotifications;
using NexApply.Api.Features.Notifications.MarkAllNotificationsRead;
using NexApply.Api.Features.Notifications.MarkNotificationRead;

namespace NexApply.Api.Features.Notifications;

public static class NotificationsEndpoints
{
    public static void MapNotificationsEndpoints(this WebApplication app)
    {
        app.MapGetNotifications();
        app.MapMarkNotificationRead();
        app.MapMarkAllNotificationsRead();
        app.MapDismissNotification();
        app.MapClearReadNotifications();
    }
}

