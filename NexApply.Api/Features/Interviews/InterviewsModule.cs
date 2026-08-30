namespace NexApply.Api.Features.Interviews;

public static class InterviewsModule
{
    public static void MapInterviews(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/company/interviews")
            .WithTags("Interviews")
            .RequireAuthorization(policy => policy.RequireRole("Company"));

        GetCompanyInterviews.Map(group);
        ScheduleInterview.Map(group);
    }
}
