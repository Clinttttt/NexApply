using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Api.Entities.Enums;
using NexApply.Api.Features.Auth;
using NexApply.Api.Features.Auth.Login;

namespace NexApply.Tests.Integration;

public class AuthenticationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public AuthenticationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsTokens()
    {
        // Arrange
        await SeedTestUser("testuser", "Test123!");

        var loginRequest = new LoginCommand("testuser", "Test123!");

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Debug: Print response if not OK
        if (response.StatusCode != HttpStatusCode.OK)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"Expected OK but got {response.StatusCode}. Response: {errorContent}");
        }

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<TokenResponseDto>();
        Assert.NotNull(result);
        Assert.NotNull(result.AccessToken);
        Assert.NotNull(result.RefreshToken);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var loginRequest = new LoginCommand("nonexistent", "WrongPassword");

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        // Arrange
        await SeedTestUser("testuser2", "CorrectPassword123!");

        var loginRequest = new LoginCommand("testuser2", "WrongPassword");

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task SwitchRole_WithValidToken_ReturnsNewToken()
    {
        // Arrange
        await SeedTestUser("roleswitch", "Test123!");
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", 
            new LoginCommand("roleswitch", "Test123!"));
        var tokens = await loginResponse.Content.ReadFromJsonAsync<TokenResponseDto>();

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokens!.AccessToken);

        // Act
        var switchResponse = await _client.PostAsJsonAsync("/api/auth/switch-role", 
            new { NewRole = UserRole.Company });

        // Assert
        Assert.Equal(HttpStatusCode.OK, switchResponse.StatusCode);

        var newTokens = await switchResponse.Content.ReadFromJsonAsync<TokenResponseDto>();
        Assert.NotNull(newTokens);
        Assert.NotNull(newTokens.AccessToken);
        Assert.NotEqual(tokens.AccessToken, newTokens.AccessToken);
    }

    [Fact]
    public async Task SwitchRole_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/switch-role", 
            new { NewRole = UserRole.Company });

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_ReturnsValidJwtToken()
    {
        // Arrange
        await SeedTestUser("jwttest", "Test123!");

        var loginRequest = new LoginCommand("jwttest", "Test123!");

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        var result = await response.Content.ReadFromJsonAsync<TokenResponseDto>();

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.AccessToken);
        
        var parts = result.AccessToken.Split('.');
        Assert.Equal(3, parts.Length);
    }

    private async Task SeedTestUser(String username, string password)
    {
        // Create a fresh DbContext with InMemory database
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("TestDb")
            .Options;
        
        using var context = new AppDbContext(options);

        var existingUser = context.Users.FirstOrDefault(u => u.Username == username);
        if (existingUser != null)
            return;

        var hasher = new PasswordHasher<User>();
        var user = User.CreateStudent($"{username}@test.com", username, string.Empty);
        
        var passwordHash = hasher.HashPassword(user, password);
        typeof(User).GetProperty("PasswordHash")!
            .SetValue(user, passwordHash);

        context.Users.Add(user);
        await context.SaveChangesAsync();
    }
}
