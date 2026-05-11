using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.StudentDashboard;

public record GetStudentDashboardQuery : IRequest<Result<StudentDashboardDto>>;
