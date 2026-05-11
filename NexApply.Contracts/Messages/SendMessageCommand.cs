using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Messages;

public record SendMessageCommand(Guid ReceiverId, string Content) : IRequest<Result<MessageDto>>;
