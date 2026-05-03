using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyApplicants;

namespace NexApply.Api.Features.CompanyApplicants.GetCompanyApplicants;

public static class GetCompanyApplicantsEndpoint
{
    public static void MapGetCompanyApplicants(this WebApplication app)
    {
        app.MapGet("/api/company/applicants", [Authorize(Roles = "Company")] async (
            [FromQuery] string? status,
            [FromQuery] string? jobListingId,
            [FromQuery] string? searchTerm,
            [FromQuery] string? sortBy,
            IMediator mediator) =>
        {
            var query = new GetCompanyApplicantsQuery(status, jobListingId, searchTerm, sortBy);
            var result = await mediator.Send(query);
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Company");
    }
}
