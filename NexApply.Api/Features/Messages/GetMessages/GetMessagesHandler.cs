using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.Messages;

namespace NexApply.Api.Features.Messages.GetMessages;

public class GetMessagesHandler : IRequestHandler<GetMessagesQuery, Result<List<MessageDto>>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public GetMessagesHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<MessageDto>>> Handle(GetMessagesQuery request, CancellationToken ct)
    {
        var userId = new Guid(_currentUser.UserId);

        // NOTE:
        // We intentionally compute invite display fields in-memory to avoid EF translating
        // ScheduledAt.AddMinutes(DurationMinutes) into a PostgreSQL interval expression that can fail
        // when the left-joined interview row is null.
        var rows = await _context.Messages
            .AsNoTracking()
            .Where(m => (m.SenderId == userId && m.ReceiverId == request.OtherUserId) ||
                        (m.SenderId == request.OtherUserId && m.ReceiverId == userId))
            .OrderBy(m => m.CreatedAt)
            .Select(m => new
            {
                m.Id,
                m.SenderId,
                m.Content,
                m.CreatedAt,
                m.Type,
                Interview = m.Interview == null ? null : new
                {
                    Position = m.Interview.Application.JobListing.Title,
                    m.Interview.ScheduledAt,
                    m.Interview.DurationMinutes,
                    Format = m.Interview.Format.ToString(),
                    m.Interview.Location
                }
            })
            .ToListAsync(ct);

        var messages = rows.Select(m => new MessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                Content = m.Content,
                SentAt = m.CreatedAt,
                Type = m.Type,
                InviteDetails = m.Type == "interview-invite" && m.Interview != null ? new InterviewInviteDetailsDto
                {
                    Position = m.Interview.Position,
                    DateDisplay = m.Interview.ScheduledAt.ToString("dddd, MMMM dd, yyyy"),
                    TimeDisplay = $"{m.Interview.ScheduledAt:h:mm tt} – {m.Interview.ScheduledAt.AddMinutes(m.Interview.DurationMinutes):h:mm tt}",
                    Format = m.Interview.Format + (m.Interview.Location != null ? " · " + m.Interview.Location : "")
                } : null
            })
            .ToList();

        // Mark as read
        var unreadMessages = await _context.Messages
            .Where(m => m.SenderId == request.OtherUserId && m.ReceiverId == userId && !m.IsRead)
            .ToListAsync(ct);

        foreach (var msg in unreadMessages)
        {
            msg.MarkAsRead();
        }

        if (unreadMessages.Any())
        {
            await _context.SaveChangesAsync(ct);
        }

        return Result<List<MessageDto>>.Success(messages);
    }
}
