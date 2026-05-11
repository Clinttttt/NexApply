using NexApply.Api.Features.CompanyApplicants.GetCompanyApplicants;
using NexApply.Api.Features.CompanyApplicants.UpdateApplicationNotes;
using NexApply.Api.Features.CompanyApplicants.UpdateApplicationStatus;

namespace NexApply.Api.Features.CompanyApplicants;

public static class CompanyApplicantsEndpoints
{
    public static void MapCompanyApplicantsEndpoints(this WebApplication app)
    {
        app.MapGetCompanyApplicants();
        app.MapUpdateApplicationStatus();
        app.MapUpdateApplicationNotes();
    }
}
