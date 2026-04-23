using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Profile.Commands;
using NexApply.Contracts.Profile.Dtos;

namespace NexApply.Api.Features.Profile.UpdateStudentProfile;

public static class UpdateStudentProfileEndpoint
{
    public static void MapUpdateStudentProfileEndpoint(this WebApplication app)
    {
        app.MapPut("/api/profile/student", async (UpdateStudentProfileCommand request, ISender mediator) =>
        {
            var result = await mediator.Send(request);
            return ResultExtensions.ToIResult(result);
        })
        .RequireAuthorization()
        .Accepts<UpdateStudentProfileCommand>("application/json")
        .Produces<StudentProfileDto>(200)
        .Produces(404)
        .WithTags("Profile");
    }
}
