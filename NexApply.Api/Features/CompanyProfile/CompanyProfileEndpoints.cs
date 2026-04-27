using NexApply.Api.Features.CompanyProfile.GetCompanyProfile;
using NexApply.Api.Features.CompanyProfile.UpdateCompanyProfile;

namespace NexApply.Api.Features.CompanyProfile;

public static class CompanyProfileEndpoints
{
    public static void MapCompanyProfileEndpoints(this WebApplication app)
    {
        app.MapGetCompanyProfile();
        app.MapUpdateCompanyProfile();
    }
}
