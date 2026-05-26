using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Applications;
using NexApply.Contracts.Auth;

namespace NexApply.Tests.Integration;

public class StudentApplicationsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public StudentApplicationsTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetMyApplications_WithValidStudentToken_ReturnsApplications()
    {
        // Arrange
        const string username = "apps_student";
        const string email = "apps_student@test.com";
        const string password = "Test123!";

        await SeedStudentWithOneApplication(username, password);

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new LoginCommand(email, password));
        loginResponse.EnsureSuccessStatusCode();
        var tokens = await loginResponse.Content.ReadFromJsonAsync<TokenResponseDto>();

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokens!.AccessToken);

        // Act
        var response = await _client.GetAsync("/api/applications");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<List<StudentApplicationDto>>();
        Assert.NotNull(result);
        Assert.NotEmpty(result);
        Assert.Equal("Submitted", result[0].Status);
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
        var companyUser = context.Users.FirstOrDefault(u => u.Username == "apps_company");
        if (companyUser is null)
        {
            var hasher = new PasswordHasher<User>();
            companyUser = User.CreateCompany("apps_company@test.com", "apps_company", string.Empty);
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
        var jobListing = context.JobListings.FirstOrDefault(j => j.Title == "Frontend Engineer Intern");
        if (jobListing is null)
        {
            jobListing = JobListing.Create(
                companyUser.Id,
                "Frontend Engineer Intern",
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

        // Application
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
