using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.StudentSettings;

namespace NexApply.Api.Features.StudentSettings.UpdateStudentFeedback;

public static class UpdateStudentFeedbackEndpoint
{
    public static void MapUpdateStudentFeedback(this IEndpointRouteBuilder app)
    {
        app.MapPut("/api/student/settings/feedback", async (UpdateStudentFeedbackCommand command, ISender sender) =>
        {
            var result = await sender.Send(command);
            return result.ToIResult();
        })
        .RequireAuthorization()
        .WithTags("Student Settings");
    }
}
