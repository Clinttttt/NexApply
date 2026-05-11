using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Messages;

public record GetMessagesQuery(Guid OtherUserId) : IRequest<Result<List<MessageDto>>>;
