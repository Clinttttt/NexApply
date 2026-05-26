using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Notifications;

public record GetNotificationsQuery() : IRequest<Result<List<NotificationDto>>>;

