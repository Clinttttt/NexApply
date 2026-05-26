using FluentValidation;
using NexApply.Contracts.Notifications;

namespace NexApply.Api.Features.Notifications.DismissNotification;

public class DismissNotificationValidator : AbstractValidator<DismissNotificationCommand>
{
    public DismissNotificationValidator()
    {
        RuleFor(x => x.NotificationId)
            .NotEmpty()
            .MaximumLength(300);
    }
}

