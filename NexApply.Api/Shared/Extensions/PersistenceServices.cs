using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;

namespace NexApply.Api.Shared.Extensions;

public static class PersistenceServices
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        return services;
    }
}
