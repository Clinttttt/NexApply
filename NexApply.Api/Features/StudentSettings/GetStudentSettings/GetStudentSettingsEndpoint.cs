using MediatR;
using NexApply.Api.Common;
using NexApply.Contracts.StudentSettings;

namespace NexApply.Api.Features.StudentSettings.GetStudentSettings;

public static class GetStudentSettingsEndpoint
{
    public static IEndpointRouteBuilder MapGetStudentSettings(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/student/settings", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetStudentSettingsQuery());
            return result.ToIResult();
        })
        .RequireAuthorization(policy => policy.RequireRole("Student"))
        .WithTags("Student Settings");

        return app;
    }
}

