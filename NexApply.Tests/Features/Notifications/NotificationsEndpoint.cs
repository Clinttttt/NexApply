using System.Net.Http.Json;
using NexApply.Api.Features.Notifications;

namespace NexApply.Tests.Features.Notifications;

internal static class NotificationsEndpoint
{
    public static async Task<List<NotificationResponse>> GetAsync(HttpClient client)
    {
        var response = await client.GetAsync("/api/notifications");
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<List<NotificationResponse>>() ?? [];
    }
}
