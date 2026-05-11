using NexApply.Api.Features.StudentDashboard.GetStudentDashboard;

namespace NexApply.Api.Features.StudentDashboard;

public static class StudentDashboardEndpoints
{
    public static void MapStudentDashboardEndpoints(this WebApplication app)
    {
        app.MapGetStudentDashboard();
    }
}
