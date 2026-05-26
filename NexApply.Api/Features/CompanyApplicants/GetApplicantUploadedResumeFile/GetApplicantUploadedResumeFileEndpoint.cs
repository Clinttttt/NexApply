using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Contracts.CompanyApplicants;

namespace NexApply.Api.Features.CompanyApplicants.GetApplicantUploadedResumeFile;

public static class GetApplicantUploadedResumeFileEndpoint
{
    public static void MapGetApplicantUploadedResumeFile(this WebApplication app)
    {
        app.MapGet("/api/company/applicants/{applicationId:guid}/resume/uploaded-file", [Authorize(Roles = "Company")] async (
            Guid applicationId,
            ISender mediator) =>
        {
            var result = await mediator.Send(new GetApplicantUploadedResumeFileQuery(applicationId));

            return result.IsSuccess && result.Value is not null
                ? Results.File(result.Value.FileData, result.Value.ContentType, result.Value.FileName)
                : Results.NotFound(new { result.Error });
        })
        .WithTags("Company");
    }
}

