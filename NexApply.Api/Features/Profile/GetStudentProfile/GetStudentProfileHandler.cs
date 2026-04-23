using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.Profile.Commands;
using NexApply.Contracts.Profile.Dtos;
using NexApply.Contracts.Profile.Queries;

namespace NexApply.Api.Features.Profile.GetStudentProfile;

public class GetStudentProfileHandler(AppDbContext context, CurrentUser currentUser) : IRequestHandler<GetStudentProfileQuery, Result<StudentProfileDto>>
{
    public async Task<Result<StudentProfileDto>> Handle(GetStudentProfileQuery request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);
        var profile = await context.StudentProfiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        
        if (profile is null) return Result<StudentProfileDto>.NotFound("Profile not found");

        return Result<StudentProfileDto>.Success(new StudentProfileDto
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
            ResumeFilePath = profile.ResumeFilePath
        });
    }
}
