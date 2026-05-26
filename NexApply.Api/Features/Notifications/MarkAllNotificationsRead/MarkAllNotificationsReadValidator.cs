using FluentValidation;
using NexApply.Contracts.Notifications;

namespace NexApply.Api.Features.Notifications.MarkAllNotificationsRead;

public class MarkAllNotificationsReadValidator : AbstractValidator<MarkAllNotificationsReadCommand>
{
    public MarkAllNotificationsReadValidator()
    {
        // No input fields to validate.
    }
}

