using System.Net.Http.Headers;

namespace NexApply.Client.Securities
{
    public class AuthorizationDelegatingHandler(IHttpContextAccessor httpContextAccessor, ILogger<AuthorizationDelegatingHandler> logger) : DelegatingHandler
    {
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            try
            {
                var httpContext = httpContextAccessor.HttpContext;
                if(httpContext?.User.Identity?.IsAuthenticated == true)
                {
                    var token = httpContext.User.FindFirst("AccessToken")?.Value;
                    if (string.IsNullOrEmpty(token))
                    {
                        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    }
                    else
                    {
                        logger.LogWarning("User authenticated but no AccessToken claim found");
                    }
                }
                else
                {
                    logger.LogDebug("User not authenticated, skipping token attachment");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error attaching auth token");
            }
            return await base.SendAsync(request, cancellationToken);
        }

    }
}
