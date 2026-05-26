using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using NexApply.Api.Data;

namespace NexApply.Tests;

public class TestWebApplicationFactory : WebApplicationFactory<NexApply.Api.ApplicationAssemblyMarker>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        
        // Add test configuration
        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AppSettings:Token"] = "ThisIsAVerySecureTestKeyThatIsLongEnoughForHS256Algorithm",
                ["AppSettings:Issuer"] = "TestIssuer",
                ["AppSettings:Audience"] = "TestAudience",
                // Prevent Google auth provider initialization failures in tests
                ["Authentication:Google:ClientId"] = "test-client-id",
                ["Authentication:Google:ClientSecret"] = "test-client-secret"
            });
        });
        
        builder.ConfigureServices(services =>
        {
            // Remove all EF Core registrations
            services.RemoveAll(typeof(DbContextOptions<AppDbContext>));
            services.RemoveAll(typeof(DbContextOptions));
            services.RemoveAll(typeof(AppDbContext));
            services.RemoveAll(typeof(IConfigureOptions<DbContextOptions<AppDbContext>>));
            services.RemoveAll(typeof(IDbContextOptionsConfiguration<AppDbContext>));

            // Add InMemory database
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseInMemoryDatabase("TestDb");
            });
        });
    }
}
