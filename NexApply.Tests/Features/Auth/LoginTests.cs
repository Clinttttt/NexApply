using System.Net;
using System.Net.Http.Json;
using NexApply.Api.Features.Auth;

namespace NexApply.Tests.Features.Auth;

public class LoginTests(TestWebApplicationFactory factory) : IClassFixture<TestWebApplicationFactory>
{
    [Fact]
    public async Task WithValidCredentials_ReturnsTokens()
    {
        var client = factory.CreateClient();
        await TestDatabase.AddStudentAsync("login_valid");

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new Login.Command("login_valid@test.com", TestDatabase.Password));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var tokens = await response.Content.ReadFromJsonAsync<TokenResponse>();
        Assert.NotNull(tokens);
        Assert.NotNull(tokens.AccessToken);
        Assert.NotNull(tokens.RefreshToken);
    }

    [Fact]
    public async Task WithUnknownEmail_ReturnsUnauthorized()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new Login.Command("nonexistent@test.com", "WrongPassword"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task WithWrongPassword_ReturnsUnauthorized()
    {
        var client = factory.CreateClient();
        await TestDatabase.AddStudentAsync("login_wrong_password");

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new Login.Command("login_wrong_password@test.com", "WrongPassword"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ReturnsAccessTokenWithThreeJwtSegments()
    {
        var client = factory.CreateClient();
        await TestDatabase.AddStudentAsync("login_jwt");

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new Login.Command("login_jwt@test.com", TestDatabase.Password));

        var tokens = await response.Content.ReadFromJsonAsync<TokenResponse>();
        Assert.NotNull(tokens?.AccessToken);
        Assert.Equal(3, tokens.AccessToken.Split('.').Length);
    }
}
