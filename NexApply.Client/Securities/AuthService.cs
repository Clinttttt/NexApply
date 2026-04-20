using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Npgsql;
using System.Text.Json;

namespace NexApply.Client.Securities
{
    public class AuthService(IJSRuntime js, NavigationManager navigation, AuthStateProvider authState)
    {
        public async Task<bool> Login(string username, string password)
        {
            try {
                var LoginData = new { username, password };
                var json = JsonSerializer.Serialize(LoginData);
                var success = await js.InvokeAsync<bool>("loginWithCookies", "/api/authproxy/login", json);
                if (!success) return false;

                await authState.MarkUserAsAuthenticated();
                navigation.NavigateTo("/menu", forceLoad: true);
                return true;
            }
            catch { return false; }
        }

        public async Task LogoutAsync()
        {
            try
            {
                await js.InvokeVoidAsync("fetch", "/api/authproxy/logout", new { method = "POST" });
                await authState.MarkUserAsLoggedOut();
                navigation.NavigateTo("/login");
            }
            catch (Exception ex)
            {
                throw;
            }
        }
    }
}
