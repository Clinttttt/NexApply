using FluentValidation;
using NexApply.Contracts.Messages;

namespace NexApply.Api.Features.Messages.SendMessage;

public class SendMessageValidator : AbstractValidator<SendMessageCommand>
{
    public SendMessageValidator()
    {
        RuleFor(x => x.ReceiverId).NotEmpty();
        RuleFor(x => x.Content).NotEmpty().MaximumLength(5000);
    }
}
