using NexApply.Api.Features.CompanyApplicants.GetCompanyApplicants;
using NexApply.Api.Features.CompanyApplicants.GetCompanyApplicant;
using NexApply.Api.Features.CompanyApplicants.GetApplicantResumeContent;
using NexApply.Api.Features.CompanyApplicants.GetApplicantUploadedResumeFile;
using NexApply.Api.Features.CompanyApplicants.UpdateApplicationNotes;
using NexApply.Api.Features.CompanyApplicants.UpdateApplicationStatus;

namespace NexApply.Api.Features.CompanyApplicants;

public static class CompanyApplicantsEndpoints
{
    public static void MapCompanyApplicantsEndpoints(this WebApplication app)
    {
        app.MapGetCompanyApplicants();
        app.MapGetCompanyApplicant();
        app.MapGetApplicantResumeContent();
        app.MapGetApplicantUploadedResumeFile();
        app.MapUpdateApplicationStatus();
        app.MapUpdateApplicationNotes();
    }
}
