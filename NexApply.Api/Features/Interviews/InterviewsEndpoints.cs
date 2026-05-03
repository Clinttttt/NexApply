using NexApply.Api.Features.Interviews.GetCompanyInterviews;
using NexApply.Api.Features.Interviews.ScheduleInterview;

namespace NexApply.Api.Features.Interviews;

public static class InterviewsEndpoints
{
    public static void MapInterviewsEndpoints(this WebApplication app)
    {
        app.MapGetCompanyInterviews();
        app.MapScheduleInterview();
    }
}
