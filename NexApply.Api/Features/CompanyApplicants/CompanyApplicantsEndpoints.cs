using NexApply.Api.Features.CompanyApplicants.GetCompanyApplicants;

namespace NexApply.Api.Features.CompanyApplicants;

public static class CompanyApplicantsEndpoints
{
    public static void MapCompanyApplicantsEndpoints(this WebApplication app)
    {
        app.MapGetCompanyApplicants();
    }
}
