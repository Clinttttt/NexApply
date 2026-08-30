using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Notifications;

public static class ClearReadNotifications
{
    public sealed record Command : IRequest<Result<bool>>;

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

            var states = await context.NotificationStates
                .Where(state => state.StudentId == student.Id && state.IsRead && !state.IsDismissed)
                .ToListAsync(cancellationToken);

            foreach (var state in states)
            {
                state.Dismiss();
            }

            await context.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/clear-read", async (ISender sender, CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Command(), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(ClearReadNotifications));
}
