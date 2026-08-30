namespace NexApply.Api.Features.StudentSettings;

public static class StudentSettingsModule
{
    public static void MapStudentSettings(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/student/settings")
            .WithTags("Student Settings")
            .RequireAuthorization();

        GetStudentSettings.Map(group);
        UpdateStudentFeedback.Map(group);
    }
}
