using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Components.Server.Circuits;
using NexApply.Api.Features.Auth;
using NexApply.Client.Interfaces;
using NexApply.Client.Securities;
using NexApply.Client.Services.Auth;

namespace NexApply.Client
{
    public  static class DependencyInjection
    {
        public static IServiceCollection AddClient(this IServiceCollection service, IConfiguration configuration)
        {
            service.AddScoped<IAuthApiService, AuthApiService>();
            service.AddHttpContextAccessor();
            service.AddControllers();

            AddPersistence(service,configuration);


            service.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
          .AddCookie(options =>
          {
              options.Cookie.Name = ".AspNetCore.Cookies";
              options.Cookie.HttpOnly = true;
              options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
              options.Cookie.SameSite = SameSiteMode.Strict;
              options.ExpireTimeSpan = TimeSpan.FromDays(7);
              options.SlidingExpiration = true;
              options.LoginPath = "/login";
              options.LogoutPath = "/api/authproxy/logout";
          });

            service.AddScoped<NexApply.Client.Securities.TokenService>();
            service.AddScoped<CircuitHandler, TokenCircuitHandler>();
            service.AddScoped<AuthService>();
            service.AddScoped<AuthorizationDelegatingHandler>();
            service.AddScoped<RefreshTokenDelegatingHandler>();
            service.AddScoped<AuthStateProvider>();
            service.AddScoped<AuthenticationStateProvider>(provider =>
              provider.GetRequiredService<AuthStateProvider>());

            return service;
        }

        public static IServiceCollection AddPersistence(this IServiceCollection service, IConfiguration configuration)
        {
            service.AddHttpClient<IAuthApiService, AuthApiService>("AuthClient", client =>
            {
                client.BaseAddress = new Uri(configuration["ApiBaseUrl"]!);
            });

    
            return service;
        }
    }
}
