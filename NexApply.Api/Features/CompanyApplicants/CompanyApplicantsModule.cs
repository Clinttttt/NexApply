namespace NexApply.Api.Features.CompanyApplicants;

public static class CompanyApplicantsModule
{
    public static void MapCompanyApplicants(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/company/applicants")
            .WithTags("Company Applicants")
            .RequireAuthorization(policy => policy.RequireRole("Company"));

        GetCompanyApplicants.Map(group);
        GetCompanyApplicant.Map(group);
        GetApplicantResumeContent.Map(group);
        GetApplicantUploadedResumeFile.Map(group);
        UpdateApplicationStatus.Map(group);
        UpdateApplicationNotes.Map(group);
    }
}
