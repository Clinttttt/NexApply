using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Notifications;

public static class DismissNotification
{
    public sealed record Command(string NotificationId) : IRequest<Result<bool>>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(command => command.NotificationId)
                .NotEmpty()
                .MaximumLength(300);
        }
    }

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Command, Result<bool>>
    {
        public async Task<Result<bool>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var student = await context.StudentProfiles
                .FirstOrDefaultAsync(profile => profile.UserId == userId, cancellationToken);

            if (student is null)
            {
                return Result<bool>.NotFound("Student profile not found");
            }

            var state = await context.NotificationStates.FirstOrDefaultAsync(
                notificationState => notificationState.StudentId == student.Id
                    && notificationState.NotificationId == request.NotificationId,
                cancellationToken);

            if (state is null)
            {
                state = NotificationState.Create(student.Id, request.NotificationId);
                context.NotificationStates.Add(state);
            }

            state.Dismiss();
            await context.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapDelete("/{notificationId}", async (
                string notificationId,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Command(notificationId), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(DismissNotification));
}
