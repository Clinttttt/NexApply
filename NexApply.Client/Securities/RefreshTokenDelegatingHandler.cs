using System.Net;

namespace NexApply.Client.Securities
{
    public class RefreshTokenDelegatingHandler() : DelegatingHandler
    {
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
        
            var response = await base.SendAsync(request, cancellationToken);
            if(response.StatusCode == HttpStatusCode.Unauthorized)
            {
                
            }
            return response;
        }
    }
}
