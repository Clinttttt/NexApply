namespace NexApply.Api.Features.CompanySettings;

public static class CompanySettingsModule
{
    public static void MapCompanySettings(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/company/settings")
            .WithTags("Company Settings")
            .RequireAuthorization(policy => policy.RequireRole("Company"));

        GetCompanySettings.Map(group);
        UpdateCompanySettings.Map(group);
        UpdateCompanyTestimonial.Map(group);
    }
}
