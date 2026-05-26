using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Notifications;

public record MarkAllNotificationsReadCommand() : IRequest<Result<bool>>;

