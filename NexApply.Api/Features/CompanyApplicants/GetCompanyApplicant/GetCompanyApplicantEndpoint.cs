using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.CompanyApplicants;

namespace NexApply.Api.Features.CompanyApplicants.GetCompanyApplicant;

public static class GetCompanyApplicantEndpoint
{
    public static void MapGetCompanyApplicant(this WebApplication app)
    {
        app.MapGet("/api/company/applicants/{applicationId:guid}", [Authorize(Roles = "Company")] async (
            Guid applicationId,
            IMediator mediator) =>
        {
            var query = new GetCompanyApplicantQuery(applicationId);
            var result = await mediator.Send(query);
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Company");
    }
}

