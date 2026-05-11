using NexApply.Api.Features.Applications.Apply;

namespace NexApply.Api.Features.Applications;

public static class ApplicationsEndpoints
{
    public static void MapApplicationsEndpoints(this WebApplication app)
    {
        app.MapApply();
    }
}
