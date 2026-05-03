using NexApply.Api.Features.CompanyDashboard.GetCompanyDashboard;

namespace NexApply.Api.Features.CompanyDashboard;

public static class CompanyDashboardEndpoints
{
    public static void MapCompanyDashboardEndpoints(this WebApplication app)
    {
        app.MapGetCompanyDashboard();
    }
}
