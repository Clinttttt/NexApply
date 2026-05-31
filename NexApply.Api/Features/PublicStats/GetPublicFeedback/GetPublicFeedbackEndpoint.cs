using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.PublicStats;

namespace NexApply.Api.Features.PublicStats.GetPublicFeedback;

public static class GetPublicFeedbackEndpoint
{
    public static void MapGetPublicFeedback(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/public/feedback", async (ISender sender) =>
        {
            var query = new GetPublicFeedbackQuery();
            var result = await sender.Send(query);
            return result.ToIResult();
        })
        .AllowAnonymous()
        .WithTags("Public");
    }
}
