using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using System.Text.Json;

namespace NexApply.Client.Securities
{
    public class AuthService(IJSRuntime js, NavigationManager navigation, AuthStateProvider authState)
    {
        public async Task<bool> LoginWithGoogle(string idToken)
        {
            try
            {
                var loginData = new { idToken };
                var json = JsonSerializer.Serialize(loginData);
                var success = await js.InvokeAsync<bool>("loginWithCookies", "/api/authproxy/login-google", json);
                if (!success) return false;

                await authState.MarkUserAsAuthenticated();
                navigation.NavigateTo("/menu", forceLoad: true);
                return true;
            }
            catch { return false; }
        }

        public async Task<bool> Login(string email, string password)
        {
            try {
                var loginData = new { email, password };
                var json = JsonSerializer.Serialize(loginData);
                var success = await js.InvokeAsync<bool>("loginWithCookies", "/api/authproxy/login", json);
                if (!success) return false;

                await authState.MarkUserAsAuthenticated();
                navigation.NavigateTo("/menu", forceLoad: true);
                return true;
            }
            catch { return false; }
        }

        public async Task<(bool success, string? error)> Register(string fullName, string username, string email, string password, string confirmPassword, string role)
        {
            try
            {
          
                var roleValue = role == "Student" ? 0 : 1; 
                
                var registerData = new { fullName, username, email, password, confirmPassword, role = roleValue };
                var json = JsonSerializer.Serialize(registerData);
                
                var response = await js.InvokeAsync<string>("registerUser", "/api/authproxy/register", json);
                
                if (response == "success")
                    return (true, null);
                
                return (false, response);
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }

        public async Task<bool> VerifyEmail(string email, string code)
        {
            try
            {
                var verifyData = new { email, code };
                var json = JsonSerializer.Serialize(verifyData);
                var success = await js.InvokeAsync<bool>("loginWithCookies", "/api/authproxy/verify-email", json);
                
                if (success)
                {
                    await authState.MarkUserAsAuthenticated();
                }
                
                return success;
            }
            catch { return false; }
        }

        public async Task<bool> SendVerificationCode(string email)
        {
            try
            {
                var data = new { email };
                var json = JsonSerializer.Serialize(data);
                return await js.InvokeAsync<bool>("sendRequest", "/api/authproxy/send-verification-code", json);
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
