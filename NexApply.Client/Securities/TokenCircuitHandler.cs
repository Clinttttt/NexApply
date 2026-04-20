using Microsoft.AspNetCore.Components.Server.Circuits;

namespace NexApply.Client.Securities
{
    public class TokenCircuitHandler(IHttpContextAccessor httpContextAccessor, TokenService tokenService) : CircuitHandler
    {
        public override Task OnConnectionUpAsync(Circuit circuit, CancellationToken cancellationToken)
        {
            var httpContext = httpContextAccessor.HttpContext;
            if (httpContext is not null)
            {
                if (httpContext.User.Identity?.IsAuthenticated == true)
                {
                    var token = httpContext.User.FindFirst("AccessToken")?.Value;
                    if (!string.IsNullOrEmpty(token))
                    {
                        tokenService.SetToken(token);
                    }
                }
            }

            return base.OnConnectionUpAsync(circuit, cancellationToken);
        }
    }
}
