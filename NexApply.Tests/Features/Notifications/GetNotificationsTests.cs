using System.Net;
using System.Net.Http.Json;
using NexApply.Api.Features.Notifications;

namespace NexApply.Tests.Features.Notifications;

public class GetNotificationsTests(TestWebApplicationFactory factory) : IClassFixture<TestWebApplicationFactory>
{
    [Fact]
    public async Task WithValidStudentToken_ReturnsNotifications()
    {
        var client = factory.CreateClient();

        await TestDatabase.AddStudentWithApplicationAsync(
            "notif_student_1",
            "notif_company",
            "Notifications Job - notif_student_1");

        await TestDatabase.AuthenticateAsync(client, "notif_student_1@test.com");

        var response = await client.GetAsync("/api/notifications");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var notifications = await response.Content.ReadFromJsonAsync<List<NotificationResponse>>();
        Assert.NotNull(notifications);
        Assert.NotEmpty(notifications);
    }
}
