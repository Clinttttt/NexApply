using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyDashboard;

namespace NexApply.Api.Features.CompanyDashboard.GetCompanyDashboard;

public static class GetCompanyDashboardEndpoint
{
    public static void MapGetCompanyDashboard(this WebApplication app)
    {
        app.MapGet("/api/company/dashboard", [Authorize(Roles = "Company")] async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetCompanyDashboardQuery());
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Company");
    }
}
