using MediatR;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Contracts.Common;
using NexApply.Contracts.Messages;

namespace NexApply.Api.Features.Messages.SendMessage;

public class SendMessageHandler : IRequestHandler<SendMessageCommand, Result<MessageDto>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public SendMessageHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<MessageDto>> Handle(SendMessageCommand request, CancellationToken ct)
    {
        var message = Message.CreateTextMessage(new Guid(_currentUser.UserId), request.ReceiverId, request.Content);

        _context.Messages.Add(message);
        await _context.SaveChangesAsync(ct);

        return Result<MessageDto>.Success(new MessageDto
        {
            Id = message.Id,
            SenderId = message.SenderId,
            Content = message.Content,
            SentAt = message.CreatedAt,
            Type = message.Type
        });
    }
}
