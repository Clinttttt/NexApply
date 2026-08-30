namespace NexApply.Api.Features.CompanyDashboard;

public static class CompanyDashboardModule
{
    public static void MapCompanyDashboard(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/company/dashboard")
            .WithTags("Company Dashboard")
            .RequireAuthorization(policy => policy.RequireRole("Company"));

        GetCompanyDashboard.Map(group);
    }
}
