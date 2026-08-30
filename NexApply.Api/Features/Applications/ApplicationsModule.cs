namespace NexApply.Api.Features.Applications;

public static class ApplicationsModule
{
    public static void MapApplications(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/applications")
            .WithTags("Applications")
            .RequireAuthorization(policy => policy.RequireRole("Student"));

        Apply.Map(group);
        GetMyApplications.Map(group);
    }
}
