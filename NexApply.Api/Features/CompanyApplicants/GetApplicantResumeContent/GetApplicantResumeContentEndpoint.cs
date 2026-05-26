using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.CompanyApplicants;
using NexApply.Contracts.Profile.Dtos;

namespace NexApply.Api.Features.CompanyApplicants.GetApplicantResumeContent;

public static class GetApplicantResumeContentEndpoint
{
    public static void MapGetApplicantResumeContent(this WebApplication app)
    {
        app.MapGet("/api/company/applicants/{applicationId:guid}/resume/content", [Authorize(Roles = "Company")] async (
            Guid applicationId,
            ISender mediator) =>
        {
            var result = await mediator.Send(new GetApplicantResumeContentQuery(applicationId));
            return ResultExtensions.ToIResult(result);
        })
        .Produces<ResumeContentDto>(200)
        .Produces(404)
        .WithTags("Company");
    }
}

