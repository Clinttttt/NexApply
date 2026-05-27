using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.StudentSettings;

public record GetStudentSettingsQuery() : IRequest<Result<StudentSettingsDto>>;

