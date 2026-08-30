using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Profile;

public static class UpdateResume
{
    public sealed record Command(
        string? Headline,
        string? AboutMe,
        string EducationJson,
        string WorkExperienceJson,
        string SkillsJson) : IRequest<Result<ResumeContent>>;

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Command, Result<ResumeContent>>
    {
        public async Task<Result<ResumeContent>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var profile = await context.StudentProfiles
                .FirstOrDefaultAsync(candidate => candidate.UserId == userId, cancellationToken);

            if (profile is null)
            {
                return Result<ResumeContent>.NotFound("Profile not found");
            }

            var resume = await context.Resumes
                .FirstOrDefaultAsync(candidate => candidate.StudentProfileId == profile.Id, cancellationToken);

            if (resume is null)
            {
                resume = Resume.Create(profile.Id);
                context.Resumes.Add(resume);
            }

            resume.UpdateContent(
                request.Headline,
                request.AboutMe,
                request.EducationJson,
                request.WorkExperienceJson,
                request.SkillsJson);

            profile.ClearUploadedResume();

            await context.SaveChangesAsync(cancellationToken);

            return Result<ResumeContent>.Success(new ResumeContent
            {
                Headline = request.Headline,
                AboutMe = request.AboutMe,
                Education = JsonSerializer.Deserialize<List<ResumeEducation>>(request.EducationJson) ?? [],
                WorkExperience = JsonSerializer.Deserialize<List<ResumeWorkExperience>>(request.WorkExperienceJson) ?? [],
                Skills = JsonSerializer.Deserialize<List<string>>(request.SkillsJson) ?? []
            });
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPut("/resume", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(UpdateResume));
}
