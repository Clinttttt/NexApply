namespace NexApply.Api.Features.StudentDashboard;

public static class StudentDashboardModule
{
    public static void MapStudentDashboard(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/student/dashboard")
            .WithTags("Student Dashboard")
            .RequireAuthorization(policy => policy.RequireRole("Student"));

        GetStudentDashboard.Map(group);
    }
}
