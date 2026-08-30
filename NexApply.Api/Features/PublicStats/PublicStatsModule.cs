namespace NexApply.Api.Features.PublicStats;

public static class PublicStatsModule
{
    public static void MapPublicStats(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/public")
            .WithTags("Public")
            .AllowAnonymous();

        GetPublicStats.Map(group);
        GetPublicFeedback.Map(group);
    }
}
