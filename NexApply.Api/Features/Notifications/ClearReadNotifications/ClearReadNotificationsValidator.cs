using FluentValidation;
using NexApply.Contracts.Notifications;

namespace NexApply.Api.Features.Notifications.ClearReadNotifications;

public class ClearReadNotificationsValidator : AbstractValidator<ClearReadNotificationsCommand>
{
    public ClearReadNotificationsValidator()
    {
        // No input fields to validate.
    }
}

