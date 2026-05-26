using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Auth;
using NexApply.Contracts.Notifications;

namespace NexApply.Tests.Integration;

public class NotificationsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public NotificationsTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetNotifications_WithValidStudentToken_ReturnsNotifications()
    {
        // Arrange
        const string username = "notif_student_1";
        const string email = "notif_student_1@test.com";
        const string password = "Test123!";

        await SeedStudentWithOneApplication(username, password);

        await AuthenticateAsStudent(email, password);

        // Act
        var response = await _client.GetAsync("/api/notifications");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var notifications = await response.Content.ReadFromJsonAsync<List<NotificationDto>>();
        Assert.NotNull(notifications);
        Assert.NotEmpty(notifications);
    }

    [Fact]
    public async Task MarkNotificationRead_ThenGetNotifications_ShowsIsReadTrue()
    {
        // Arrange
        const string username = "notif_student_2";
        const string email = "notif_student_2@test.com";
        const string password = "Test123!";

        await SeedStudentWithOneApplication(username, password);
        await AuthenticateAsStudent(email, password);

        var initial = await GetNotifications();
        var target = initial.First();
        Assert.False(target.IsRead);

        // Act
        var encodedId = Uri.EscapeDataString(target.Id);
        var markReadResponse = await _client.PostAsync($"/api/notifications/{encodedId}/read", null);

        // Assert
        Assert.Equal(HttpStatusCode.OK, markReadResponse.StatusCode);

        var after = await GetNotifications();
        var updated = after.Single(n => n.Id == target.Id);
        Assert.True(updated.IsRead);
    }

    [Fact]
    public async Task DismissNotification_ThenGetNotifications_HidesNotification()
    {
        // Arrange
        const string username = "notif_student_3";
        const string email = "notif_student_3@test.com";
        const string password = "Test123!";

        await SeedStudentWithOneApplication(username, password);
        await AuthenticateAsStudent(email, password);

        var initial = await GetNotifications();
        var target = initial.First();

        // Act
        var encodedId = Uri.EscapeDataString(target.Id);
        var dismissResponse = await _client.DeleteAsync($"/api/notifications/{encodedId}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, dismissResponse.StatusCode);

        var after = await GetNotifications();
        Assert.DoesNotContain(after, n => n.Id == target.Id);
    }

    [Fact]
    public async Task ClearReadNotifications_HidesReadNotifications()
    {
        // Arrange
        const string username = "notif_student_4";
        const string email = "notif_student_4@test.com";
        const string password = "Test123!";

        await SeedStudentWithOneApplication(username, password);
        await AuthenticateAsStudent(email, password);

        var initial = await GetNotifications();
        var target = initial.First();

        // Mark it read first
        var encodedId = Uri.EscapeDataString(target.Id);
        var markReadResponse = await _client.PostAsync($"/api/notifications/{encodedId}/read", null);
        Assert.Equal(HttpStatusCode.OK, markReadResponse.StatusCode);

        // Act
        var clearResponse = await _client.PostAsync("/api/notifications/clear-read", null);

        // Assert
        Assert.Equal(HttpStatusCode.OK, clearResponse.StatusCode);

        var after = await GetNotifications();
        Assert.DoesNotContain(after, n => n.Id == target.Id);
    }

    private async Task AuthenticateAsStudent(string email, string password)
    {
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new LoginCommand(email, password));
        loginResponse.EnsureSuccessStatusCode();

        var tokens = await loginResponse.Content.ReadFromJsonAsync<TokenResponseDto>();
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokens!.AccessToken);
    }

    private async Task<List<NotificationDto>> GetNotifications()
    {
        var response = await _client.GetAsync("/api/notifications");
        response.EnsureSuccessStatusCode();

        var notifications = await response.Content.ReadFromJsonAsync<List<NotificationDto>>();
        return notifications ?? [];
    }

    private static async Task SeedStudentWithOneApplication(string username, string password)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("TestDb")
            .Options;

        await using var context = new AppDbContext(options);

        // Student user
        var studentUser = context.Users.FirstOrDefault(u => u.Username == username);
        if (studentUser is null)
        {
            var hasher = new PasswordHasher<User>();
            studentUser = User.CreateStudent($"{username}@test.com", username, string.Empty);
            var passwordHash = hasher.HashPassword(studentUser, password);
            typeof(User).GetProperty("PasswordHash")!.SetValue(studentUser, passwordHash);
            context.Users.Add(studentUser);
            await context.SaveChangesAsync();
        }

        // Student profile
        var studentProfile = context.StudentProfiles.FirstOrDefault(p => p.UserId == studentUser.Id);
        if (studentProfile is null)
        {
            studentProfile = StudentProfile.Create(studentUser.Id, "Test Student");
            context.StudentProfiles.Add(studentProfile);
            await context.SaveChangesAsync();
        }

        // Company user + profile
        var companyUser = context.Users.FirstOrDefault(u => u.Username == "notif_company");
        if (companyUser is null)
        {
            var hasher = new PasswordHasher<User>();
            companyUser = User.CreateCompany("notif_company@test.com", "notif_company", string.Empty);
            var passwordHash = hasher.HashPassword(companyUser, "Company123!");
            typeof(User).GetProperty("PasswordHash")!.SetValue(companyUser, passwordHash);
            context.Users.Add(companyUser);
            await context.SaveChangesAsync();
        }

        var companyProfile = context.CompanyProfiles.FirstOrDefault(c => c.UserId == companyUser.Id);
        if (companyProfile is null)
        {
            companyProfile = CompanyProfile.Create(companyUser.Id, "Acme Corp");
            context.CompanyProfiles.Add(companyProfile);
            await context.SaveChangesAsync();
        }

        // Job listing
        var jobListing = context.JobListings.FirstOrDefault(j => j.Title == $"Notifications Job - {username}");
        if (jobListing is null)
        {
            jobListing = JobListing.Create(
                companyUser.Id,
                $"Notifications Job - {username}",
                "desc",
                "resp",
                "qual",
                "skills",
                null,
                "Cebu City",
                JobType.Internship,
                WorkSetup.Remote,
                null,
                null,
                null,
                1,
                null);
            context.JobListings.Add(jobListing);
            await context.SaveChangesAsync();
        }

        // Application (Submitted)
        var existingApplication = context.Applications.FirstOrDefault(a =>
            a.StudentId == studentProfile.Id && a.JobListingId == jobListing.Id);

        if (existingApplication is null)
        {
            var application = Application.Create(studentProfile.Id, jobListing.Id, null, null);
            context.Applications.Add(application);
            await context.SaveChangesAsync();
        }
    }
}

