using System.Net;

namespace NexApply.Tests.Features.Notifications;

public class MarkNotificationReadTests(TestWebApplicationFactory factory) : IClassFixture<TestWebApplicationFactory>
{
    [Fact]
    public async Task MarksNotificationAsRead()
    {
        var client = factory.CreateClient();

        await TestDatabase.AddStudentWithApplicationAsync(
            "notif_student_2",
            "notif_company",
            "Notifications Job - notif_student_2");

        await TestDatabase.AuthenticateAsync(client, "notif_student_2@test.com");

        var notifications = await NotificationsEndpoint.GetAsync(client);
        var target = notifications.First();
        Assert.False(target.IsRead);

        var response = await client.PostAsync(
            $"/api/notifications/{Uri.EscapeDataString(target.Id)}/read",
            null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await NotificationsEndpoint.GetAsync(client);
        Assert.True(updated.Single(notification => notification.Id == target.Id).IsRead);
    }
}
