using NexApply.Api.Features.StudentSettings.GetStudentSettings;
using NexApply.Api.Features.StudentSettings.UpdateStudentFeedback;

namespace NexApply.Api.Features.StudentSettings;

public static class StudentSettingsEndpoints
{
    public static void MapStudentSettingsEndpoints(this WebApplication app)
    {
        app.MapGetStudentSettings();
        app.MapUpdateStudentFeedback();
    }
}

