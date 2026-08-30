using System.Net;

namespace NexApply.Tests.Features.Notifications;

public class DismissNotificationTests(TestWebApplicationFactory factory) : IClassFixture<TestWebApplicationFactory>
{
    [Fact]
    public async Task HidesNotificationFromTheList()
    {
        var client = factory.CreateClient();

        await TestDatabase.AddStudentWithApplicationAsync(
            "notif_student_3",
            "notif_company",
            "Notifications Job - notif_student_3");

        await TestDatabase.AuthenticateAsync(client, "notif_student_3@test.com");

        var notifications = await NotificationsEndpoint.GetAsync(client);
        var target = notifications.First();

        var response = await client.DeleteAsync($"/api/notifications/{Uri.EscapeDataString(target.Id)}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var remaining = await NotificationsEndpoint.GetAsync(client);
        Assert.DoesNotContain(remaining, notification => notification.Id == target.Id);
    }
}
