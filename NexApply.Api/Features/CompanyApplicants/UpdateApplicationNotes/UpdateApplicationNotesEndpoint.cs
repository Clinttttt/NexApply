using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyApplicants;

namespace NexApply.Api.Features.CompanyApplicants.UpdateApplicationNotes;

public static class UpdateApplicationNotesEndpoint
{
    public static void MapUpdateApplicationNotes(this WebApplication app)
    {
        app.MapPatch("/api/company/applicants/{applicationId:guid}/notes", [Authorize(Roles = "Company")] async (
            [FromRoute] Guid applicationId,
            [FromBody] UpdateApplicationNotesRequest request,
            IMediator mediator) =>
        {
            var command = new UpdateApplicationNotesCommand(applicationId, request.RecruiterNotes);
            var result = await mediator.Send(command);
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Company");
    }
}
