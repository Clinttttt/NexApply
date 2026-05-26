using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Notifications;

public record MarkNotificationReadCommand(string NotificationId) : IRequest<Result<bool>>;

