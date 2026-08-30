using FluentValidation;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Behaviors;

namespace NexApply.Api.Shared.Extensions;

public static class ApplicationServices
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = typeof(Program).Assembly;

        services.AddValidatorsFromAssembly(assembly);
        services.AddMediatR(options =>
        {
            options.RegisterServicesFromAssembly(assembly);
            options.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        services.AddHttpContextAccessor();
        services.AddHttpClient();
        services.AddScoped<CurrentUser>();

        return services;
    }
}
