using FluentValidation;
using NexApply.Contracts.Notifications;

namespace NexApply.Api.Features.Notifications.MarkNotificationRead;

public class MarkNotificationReadValidator : AbstractValidator<MarkNotificationReadCommand>
{
    public MarkNotificationReadValidator()
    {
        RuleFor(x => x.NotificationId)
            .NotEmpty()
            .MaximumLength(300);
    }
}

