using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Features.Auth;

namespace NexApply.Tests;

internal static class TestDatabase
{
    public const string Name = "TestDb";
    public const string Password = "Test123!";

    public static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Name)
            .Options;

        return new AppDbContext(options);
    }

    public static async Task<User> AddStudentAsync(string username, string password = Password)
    {
        await using var context = CreateContext();

        var existing = context.Users.FirstOrDefault(user => user.Username == username);
        if (existing is not null)
        {
            return existing;
        }

        var student = User.CreateStudent($"{username}@test.com", username, HashPassword(password));
        context.Users.Add(student);
        await context.SaveChangesAsync();

        return student;
    }

    public static async Task AddStudentWithApplicationAsync(
        string username,
        string companyUsername,
        string jobTitle,
        string password = Password)
    {
        var studentUser = await AddStudentAsync(username, password);

        await using var context = CreateContext();

        var studentProfile = context.StudentProfiles.FirstOrDefault(profile => profile.UserId == studentUser.Id);
        if (studentProfile is null)
        {
            studentProfile = StudentProfile.Create(studentUser.Id, "Test Student");
            context.StudentProfiles.Add(studentProfile);
            await context.SaveChangesAsync();
        }

        var companyUser = context.Users.FirstOrDefault(user => user.Username == companyUsername);
        if (companyUser is null)
        {
            companyUser = User.CreateCompany($"{companyUsername}@test.com", companyUsername, HashPassword("Company123!"));
            context.Users.Add(companyUser);
            await context.SaveChangesAsync();
        }

        if (!context.CompanyProfiles.Any(profile => profile.UserId == companyUser.Id))
        {
            context.CompanyProfiles.Add(CompanyProfile.Create(companyUser.Id, "Acme Corp"));
            await context.SaveChangesAsync();
        }

        var jobListing = context.JobListings.FirstOrDefault(listing => listing.Title == jobTitle);
        if (jobListing is null)
        {
            jobListing = JobListing.Create(
                companyUser.Id,
                jobTitle,
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

        var hasApplication = context.Applications.Any(application =>
            application.StudentId == studentProfile.Id && application.JobListingId == jobListing.Id);

        if (!hasApplication)
        {
            context.Applications.Add(Application.Create(studentProfile.Id, jobListing.Id, null, null));
            await context.SaveChangesAsync();
        }
    }

    public static async Task AuthenticateAsync(HttpClient client, string email, string password = Password)
    {
        var response = await client.PostAsJsonAsync("/api/auth/login", new Login.Command(email, password));
        response.EnsureSuccessStatusCode();

        var tokens = await response.Content.ReadFromJsonAsync<TokenResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);
    }

    private static string HashPassword(string password) => new PasswordHasher<User>().HashPassword(null!, password);
}
