using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Api.Domain.Common;
using NexApply.Api.Shared.Authorization;
using NexApply.Api.Shared.Extensions;

namespace NexApply.Api.Features.Messages;

public static class GetMessages
{
    private const string InterviewInviteType = "interview-invite";

    public sealed record Query(Guid OtherUserId) : IRequest<Result<List<MessageResponse>>>;

    private sealed record InvitePreview(
        string Position,
        DateTime ScheduledAt,
        int DurationMinutes,
        string Format,
        string? Location);

    private sealed record MessageRow(
        Guid Id,
        Guid SenderId,
        string Content,
        DateTime CreatedAt,
        string Type,
        InvitePreview? Interview);

    internal sealed class Handler(AppDbContext context, CurrentUser currentUser)
        : IRequestHandler<Query, Result<List<MessageResponse>>>
    {
        public async Task<Result<List<MessageResponse>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUser.UserId);

            var rows = await context.Messages
                .AsNoTracking()
                .Where(message =>
                    (message.SenderId == userId && message.ReceiverId == request.OtherUserId)
                    || (message.SenderId == request.OtherUserId && message.ReceiverId == userId))
                .OrderBy(message => message.CreatedAt)
                .Select(message => new MessageRow(
                    message.Id,
                    message.SenderId,
                    message.Content,
                    message.CreatedAt,
                    message.Type,
                    message.Interview == null
                        ? null
                        : new InvitePreview(
                            message.Interview.Application.JobListing.Title,
                            message.Interview.ScheduledAt,
                            message.Interview.DurationMinutes,
                            message.Interview.Format.ToString(),
                            message.Interview.Location)))
                .ToListAsync(cancellationToken);

            await MarkConversationAsReadAsync(userId, request.OtherUserId, cancellationToken);

            var messages = rows
                .Select(row => new MessageResponse
                {
                    Id = row.Id,
                    SenderId = row.SenderId,
                    Content = row.Content,
                    SentAt = row.CreatedAt,
                    Type = row.Type,
                    InviteDetails = BuildInviteDetails(row)
                })
                .ToList();

            return Result<List<MessageResponse>>.Success(messages);
        }

        private async Task MarkConversationAsReadAsync(Guid userId, Guid otherUserId, CancellationToken cancellationToken)
        {
            var unreadMessages = await context.Messages
                .Where(message => message.SenderId == otherUserId && message.ReceiverId == userId && !message.IsRead)
                .ToListAsync(cancellationToken);

            if (unreadMessages.Count == 0)
            {
                return;
            }

            foreach (var message in unreadMessages)
            {
                message.MarkAsRead();
            }

            await context.SaveChangesAsync(cancellationToken);
        }

        private static InterviewInviteDetails? BuildInviteDetails(MessageRow row)
        {
            if (row.Type != InterviewInviteType || row.Interview is null)
            {
                return null;
            }

            var invite = row.Interview;
            var endsAt = invite.ScheduledAt.AddMinutes(invite.DurationMinutes);

            return new InterviewInviteDetails
            {
                Position = invite.Position,
                DateDisplay = invite.ScheduledAt.ToString("dddd, MMMM dd, yyyy"),
                TimeDisplay = $"{invite.ScheduledAt:h:mm tt} \u2013 {endsAt:h:mm tt}",
                Format = invite.Location is not null
                    ? $"{invite.Format} \u00b7 {invite.Location}"
                    : invite.Format
            };
        }
    }

    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/{otherUserId:guid}", async (
                Guid otherUserId,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new Query(otherUserId), cancellationToken);
                return result.ToHttpResult();
            })
            .WithName(nameof(GetMessages));
}
