using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Notifications;

public record DismissNotificationCommand(string NotificationId) : IRequest<Result<bool>>;

