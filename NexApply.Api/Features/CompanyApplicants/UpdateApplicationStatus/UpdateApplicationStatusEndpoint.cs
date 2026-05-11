using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyApplicants;

namespace NexApply.Api.Features.CompanyApplicants.UpdateApplicationStatus;

public static class UpdateApplicationStatusEndpoint
{
    public static void MapUpdateApplicationStatus(this WebApplication app)
    {
        app.MapPatch("/api/company/applicants/{applicationId:guid}/status", [Authorize(Roles = "Company")] async (
            [FromRoute] Guid applicationId,
            [FromBody] UpdateApplicationStatusRequest request,
            IMediator mediator) =>
        {
            var command = new UpdateApplicationStatusCommand(applicationId, request.Status);
            var result = await mediator.Send(command);
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Company");
    }
}
