using NexApply.Api.Features.CompanySettings.GetCompanySettings;
using NexApply.Api.Features.CompanySettings.UpdateCompanySettings;

namespace NexApply.Api.Features.CompanySettings;

public static class CompanySettingsEndpoints
{
    public static void MapCompanySettingsEndpoints(this WebApplication app)
    {
        app.MapGetCompanySettings();
        app.MapUpdateCompanySettings();
    }
}

