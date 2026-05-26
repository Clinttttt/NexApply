using NexApply.Api.Features.SavedJobs.GetSavedJobs;
using NexApply.Api.Features.SavedJobs.SaveJob;
using NexApply.Api.Features.SavedJobs.UnsaveJob;

namespace NexApply.Api.Features.SavedJobs;

public static class SavedJobsEndpoints
{
    public static void MapSavedJobsEndpoints(this WebApplication app)
    {
        app.MapGetSavedJobs();
        app.MapSaveJob();
        app.MapUnsaveJob();
    }
}

