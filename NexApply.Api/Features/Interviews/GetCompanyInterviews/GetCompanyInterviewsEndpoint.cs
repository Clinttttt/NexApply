using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.Common;
using NexApply.Contracts.Interviews;

namespace NexApply.Api.Features.Interviews.GetCompanyInterviews;

public static class GetCompanyInterviewsEndpoint
{
    public static void MapGetCompanyInterviews(this WebApplication app)
    {
        app.MapGet("/api/company/interviews", [Authorize(Roles = "Company")] async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetCompanyInterviewsQuery());
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Interviews");
    }
}
