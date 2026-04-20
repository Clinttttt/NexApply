using NexApply.Api.Features.Auth.Login;
using NexApply.Api.Features.Auth.LoginWithEmail;
using NexApply.Api.Features.Auth.Refresh;
using NexApply.Api.Features.Auth.SwitchRole;

namespace NexApply.Api.Features.Auth
{
    
    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this WebApplication app)
        {
            app.MapLoginEndpoint();
            app.MapLoginWithEmail();
            app.MapRefreshToken();
            app.MapSwitchRoleEndpoint();
        }
    }
}
