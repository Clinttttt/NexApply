using MediatR;
using Microsoft.AspNetCore.Authorization;
using NexApply.Api.Common;
using NexApply.Contracts.StudentDashboard;

namespace NexApply.Api.Features.StudentDashboard.GetStudentDashboard;

public static class GetStudentDashboardEndpoint
{
    public static void MapGetStudentDashboard(this WebApplication app)
    {
        app.MapGet("/api/student/dashboard", [Authorize(Roles = "Student")] async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetStudentDashboardQuery());
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Student");
    }
}
