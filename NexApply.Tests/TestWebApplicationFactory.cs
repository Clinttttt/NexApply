using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
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
                ["AppSettings:Audience"] = "TestAudience"
            });
        });
        
        builder.ConfigureServices(services =>
        {
            // Remove all EF Core registrations
            services.RemoveAll(typeof(DbContextOptions<AppDbContext>));
            services.RemoveAll(typeof(DbContextOptions));
            services.RemoveAll(typeof(AppDbContext));

            // Add InMemory database
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseInMemoryDatabase("TestDb");
            });
        });
    }
}
