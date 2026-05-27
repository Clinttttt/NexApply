using NexApply.Api.Features.StudentSettings.GetStudentSettings;

namespace NexApply.Api.Features.StudentSettings;

public static class StudentSettingsEndpoints
{
    public static void MapStudentSettingsEndpoints(this WebApplication app)
    {
        app.MapGetStudentSettings();
    }
}

