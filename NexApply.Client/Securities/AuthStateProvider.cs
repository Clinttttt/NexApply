using Microsoft.AspNetCore.Components.Authorization;
using NexApply.Client.Helper;
using System.Security.Claims;

namespace NexApply.Client.Securities
{
    public class AuthStateProvider(IHttpContextAccessor httpContextAccessor) : AuthenticationStateProvider
    {
        public override Task<AuthenticationState> GetAuthenticationStateAsync()
        {
            try
            {
                var httpContext = httpContextAccessor.HttpContext;

                if (httpContext?.User.Identity?.IsAuthenticated == true)
                {
                    var AccessToken = httpContext.User.FindFirst("AccessToken")?.Value;
                    if (!string.IsNullOrEmpty(AccessToken))
                    {
                        var user = JwtParser.ParseToken(AccessToken);
                        if (user != null)
                        {
                            return Task.FromResult(new AuthenticationState(user));
                        }
                    }
                }
                return Task.FromResult(new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity())));
            }
            catch
            {
                return Task.FromResult(new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity())));
            }
        }
        public Task MarkUserAsAuthenticated()
        {
            NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
            return Task.CompletedTask;
        }
        public Task MarkUserAsLoggedOut()
        {
            NotifyAuthenticationStateChanged(Anonymous());
            return Task.CompletedTask;
        }
        private static Task<AuthenticationState> Anonymous() =>
     Task.FromResult(new AuthenticationState(
         new ClaimsPrincipal(new ClaimsIdentity())));
    }
}

