using System.Net;

namespace NexApply.Tests.Features.Notifications;

public class ClearReadNotificationsTests(TestWebApplicationFactory factory) : IClassFixture<TestWebApplicationFactory>
{
    [Fact]
    public async Task HidesNotificationsThatWereRead()
    {
        var client = factory.CreateClient();

        await TestDatabase.AddStudentWithApplicationAsync(
            "notif_student_4",
            "notif_company",
            "Notifications Job - notif_student_4");

        await TestDatabase.AuthenticateAsync(client, "notif_student_4@test.com");

        var notifications = await NotificationsEndpoint.GetAsync(client);
        var target = notifications.First();

        var markReadResponse = await client.PostAsync(
            $"/api/notifications/{Uri.EscapeDataString(target.Id)}/read",
            null);

        Assert.Equal(HttpStatusCode.OK, markReadResponse.StatusCode);

        var clearResponse = await client.PostAsync("/api/notifications/clear-read", null);

        Assert.Equal(HttpStatusCode.OK, clearResponse.StatusCode);

        var remaining = await NotificationsEndpoint.GetAsync(client);
        Assert.DoesNotContain(remaining, notification => notification.Id == target.Id);
    }
}
