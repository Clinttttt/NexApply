using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Profile;

public static class GetStudentProfile
{
    public sealed record Query : IRequest<Result<StudentProfileResponse>>;

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<StudentProfileResponse>>
    {
        public async Task<Result<StudentProfileResponse>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var profile = await context.StudentProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(candidate => candidate.UserId == userId, cancellationToken);

            if (profile is null)
            {
                return Result<StudentProfileResponse>.NotFound("Profile not found");
            }

            return Result<StudentProfileResponse>.Success(new StudentProfileResponse
            {
                FullName = profile.FullName,
                Phone = profile.Phone,
                Location = profile.Location,
                University = profile.University,
                Course = profile.Course,
                GraduationYear = profile.GraduationYear,
                LinkedIn = profile.LinkedIn,
                GitHub = profile.GitHub,
                Portfolio = profile.Portfolio,
                ResumeFilePath = profile.ResumeFilePath,
                ProfilePictureUrl = profile.ProfilePictureUrl
            });
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/student", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetStudentProfile))
            .Produces<StudentProfileResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);
}
