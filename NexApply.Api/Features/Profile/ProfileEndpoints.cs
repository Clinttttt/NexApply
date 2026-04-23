using NexApply.Api.Features.Profile.GetStudentProfile;
using NexApply.Api.Features.Profile.UpdateStudentProfile;
using NexApply.Api.Features.Profile.UploadResume;
using NexApply.Api.Features.Profile.GetResumeContent;
using NexApply.Api.Features.Profile.UpdateResume;

namespace NexApply.Api.Features.Profile;

public static class ProfileEndpoints
{
    public static void MapProfileEndpoints(this WebApplication app)
    {
        app.MapGetStudentProfileEndpoint();
        app.MapUpdateStudentProfileEndpoint();
        app.MapUploadResumeEndpoint();
        app.MapGetResumeContentEndpoint();
        app.MapUpdateResumeEndpoint();
    }
}
