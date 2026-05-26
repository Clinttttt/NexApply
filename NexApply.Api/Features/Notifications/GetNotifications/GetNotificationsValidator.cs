using FluentValidation;
using NexApply.Contracts.Notifications;

namespace NexApply.Api.Features.Notifications.GetNotifications;

public class GetNotificationsValidator : AbstractValidator<GetNotificationsQuery>
{
    public GetNotificationsValidator()
    {
        // No input fields to validate (query is based on authenticated user).
    }
}

