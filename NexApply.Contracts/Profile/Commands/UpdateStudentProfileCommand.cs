using MediatR;
using NexApply.Contracts.Common;
using NexApply.Contracts.Profile.Dtos;

namespace NexApply.Contracts.Profile.Commands;

public record UpdateStudentProfileCommand(
    string FullName,
    string? Phone,
    string? Location,
    string? University,
    string? Course,
    int? GraduationYear,
    string? LinkedIn,
    string? GitHub,
    string? Portfolio
) : IRequest<Result<StudentProfileDto>>;
