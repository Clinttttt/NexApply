namespace NexApply.Api.Features.Notifications;

public static class NotificationsModule
{
    public static void MapNotifications(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/notifications")
            .WithTags("Notifications")
            .RequireAuthorization(policy => policy.RequireRole("Student"));

        GetNotifications.Map(group);
        MarkNotificationRead.Map(group);
        MarkAllNotificationsRead.Map(group);
        DismissNotification.Map(group);
        ClearReadNotifications.Map(group);
    }
}
