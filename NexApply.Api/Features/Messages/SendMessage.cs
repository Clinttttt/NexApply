using FluentValidation;
using MediatR;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Messages;

public static class SendMessage
{
    public sealed record Command(Guid ReceiverId, string Content) : IRequest<Result<MessageResponse>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.ReceiverId).NotEmpty();
            RuleFor(command => command.Content).NotEmpty().MaximumLength(5000);
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Command, Result<MessageResponse>>
    {
        public async Task<Result<MessageResponse>> Handle(Command request, CancellationToken cancellationToken)
        {
            var senderId = Guid.Parse(currentUser.UserId);
            var message = Message.CreateTextMessage(senderId, request.ReceiverId, request.Content);

            context.Messages.Add(message);
            await context.SaveChangesAsync(cancellationToken);

            return Result<MessageResponse>.Success(new MessageResponse
            {
                Id = message.Id,
                SenderId = message.SenderId,
                Content = message.Content,
                SentAt = message.CreatedAt,
                Type = message.Type
            });
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/", async (Command command, ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(SendMessage));
}
