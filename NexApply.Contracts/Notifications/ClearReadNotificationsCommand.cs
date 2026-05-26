using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Notifications;

public record ClearReadNotificationsCommand() : IRequest<Result<bool>>;

