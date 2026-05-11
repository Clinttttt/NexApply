using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Messages;

public record GetConversationsQuery : IRequest<Result<List<ConversationDto>>>;
