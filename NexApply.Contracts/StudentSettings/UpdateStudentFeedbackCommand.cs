using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.StudentSettings;

public record UpdateStudentFeedbackCommand(string? Feedback) : IRequest<Result<bool>>;
