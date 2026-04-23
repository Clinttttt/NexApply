using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.Profile.Commands;
using NexApply.Contracts.Profile.Dtos;

namespace NexApply.Api.Features.Profile.UpdateStudentProfile;

public class UpdateStudentProfileHandler(AppDbContext context, CurrentUser currentUser) : IRequestHandler<UpdateStudentProfileCommand, Result<StudentProfileDto>>
{
    public async Task<Result<StudentProfileDto>> Handle(UpdateStudentProfileCommand request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);
        var profile = await context.StudentProfiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        
        if (profile is null) return Result<StudentProfileDto>.NotFound("Profile not found");

        profile.UpdateProfile(
            request.FullName,
            request.Phone,
            request.Location,
            request.University,
            request.Course,
            request.GraduationYear,
            request.LinkedIn,
            request.GitHub,
            request.Portfolio
        );

        await context.SaveChangesAsync(ct);

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
