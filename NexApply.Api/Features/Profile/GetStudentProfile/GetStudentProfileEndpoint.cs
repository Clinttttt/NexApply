using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.Profile.Dtos;
using NexApply.Contracts.Profile.Queries;

namespace NexApply.Api.Features.Profile.GetStudentProfile;

public static class GetStudentProfileEndpoint
{
    public static void MapGetStudentProfileEndpoint(this WebApplication app)
    {
        app.MapGet("/api/profile/student", async (ISender mediator) =>
        {
            var result = await mediator.Send(new GetStudentProfileQuery());
            return ResultExtensions.ToIResult(result);
        })
        .RequireAuthorization()
        .Produces<StudentProfileDto>(200)
        .Produces(404)
        .WithTags("Profile");
    }
}
