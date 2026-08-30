namespace NexApply.Api.Features.Profile;

public static class ProfileModule
{
    public static void MapProfile(this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/profile")
            .WithTags("Profile")
            .RequireAuthorization();

        GetStudentProfile.Map(group);
        UpdateStudentProfile.Map(group);
        UploadResume.Map(group);
        GetResumeContent.Map(group);
        GetUploadedResumeFile.Map(group);
        UpdateResume.Map(group);
    }
}
