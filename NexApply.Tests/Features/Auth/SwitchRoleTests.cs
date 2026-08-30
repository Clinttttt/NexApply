using System.Net;
using System.Net.Http.Json;
using NexApply.Api.Domain.Enums;
using NexApply.Api.Features.Auth;

namespace NexApply.Tests.Features.Auth;

public class SwitchRoleTests(TestWebApplicationFactory factory) : IClassFixture<TestWebApplicationFactory>
{
    [Fact]
    public async Task WithValidToken_ReturnsNewToken()
    {
        var client = factory.CreateClient();
        await TestDatabase.AddStudentAsync("switch_role");
        await TestDatabase.AuthenticateAsync(client, "switch_role@test.com");

        var previousToken = client.DefaultRequestHeaders.Authorization!.Parameter;

        var response = await client.PostAsJsonAsync(
            "/api/auth/switch-role",
            new SwitchRole.Command(UserRole.Company));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var tokens = await response.Content.ReadFromJsonAsync<TokenResponse>();
        Assert.NotNull(tokens?.AccessToken);
        Assert.NotEqual(previousToken, tokens.AccessToken);
    }

    [Fact]
    public async Task WithoutAuthentication_ReturnsUnauthorized()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/switch-role",
            new SwitchRole.Command(UserRole.Company));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
