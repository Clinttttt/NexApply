namespace NexApply.Api.Features.SavedJobs;

public static class SavedJobsModule
{
    public static void MapSavedJobs(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/saved-jobs")
            .WithTags("Saved Jobs")
            .RequireAuthorization(policy => policy.RequireRole("Student"));

        GetSavedJobs.Map(group);
        SaveJob.Map(group);
        UnsaveJob.Map(group);
    }
}
