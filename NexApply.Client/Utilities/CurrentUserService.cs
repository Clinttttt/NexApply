using Microsoft.AspNetCore.Components.Authorization;
using System.Security.Claims;

namespace NexApply.Client.Utilities;

public class CurrentUserService(AuthenticationStateProvider authStateProvider)
{
    public async Task<string> GetEmailAsync()
    {
        var authState = await authStateProvider.GetAuthenticationStateAsync();
        return authState.User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
    }

    public async Task<string> GetUserIdAsync()
    {
        var authState = await authStateProvider.GetAuthenticationStateAsync();
        return authState.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
    }

    public async Task<string> GetRoleAsync()
    {
        var authState = await authStateProvider.GetAuthenticationStateAsync();
        return authState.User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
    }

    public async Task<bool> IsAuthenticatedAsync()
    {
        var authState = await authStateProvider.GetAuthenticationStateAsync();
        return authState.User.Identity?.IsAuthenticated ?? false;
    }
}
