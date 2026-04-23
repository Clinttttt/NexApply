using MediatR;
using NexApply.Contracts.Common;
using NexApply.Contracts.Profile.Dtos;

namespace NexApply.Contracts.Profile.Commands;

public record UpdateResumeCommand(
    string? Headline,
    string? AboutMe,
    string EducationJson,
    string WorkExperienceJson,
    string SkillsJson
) : IRequest<Result<ResumeContentDto>>;
