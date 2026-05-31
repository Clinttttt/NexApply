using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.PublicStats;

namespace NexApply.Api.Features.PublicStats.GetPublicStats;

public static class GetPublicStatsEndpoint
{
    public static void MapGetPublicStats(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/public/stats", async (ISender sender) =>
        {
            var query = new GetPublicStatsQuery();
            var result = await sender.Send(query);
            return result.ToIResult();
        })
        .AllowAnonymous()
        .WithTags("Public");
    }
}
