using NexApply.Client.Securities;

namespace NexApply.Client.Extensions
{
    public static class HttpClientExtensions 
    {
        public static IHttpClientBuilder AddApiHttpClient<TClient, TImplementation>
            (this IServiceCollection services, IConfiguration configuration) where TClient : class where TImplementation : class, TClient
        {
            return services.AddHttpClient<TClient, TImplementation>(client =>
            {
                client.BaseAddress = new Uri(configuration["ApiBaseUrl"]!);
            }).AddHttpMessageHandler<RefreshTokenDelegatingHandler>()
            .AddHttpMessageHandler(s=> s.GetRequiredService<AuthorizationDelegatingHandler>());
              
        }
    }
}
