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

        var messages = await _context.Messages
            .Include(m => m.Interview)
                .ThenInclude(i => i!.Application)
                    .ThenInclude(a => a.JobListing)
            .Where(m => (m.SenderId == userId && m.ReceiverId == request.OtherUserId) ||
                       (m.SenderId == request.OtherUserId && m.ReceiverId == userId))
            .OrderBy(m => m.CreatedAt)
            .Select(m => new MessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                Content = m.Content,
                SentAt = m.CreatedAt,
                Type = m.Type,
                InviteDetails = m.Type == "interview-invite" && m.Interview != null ? new InterviewInviteDetailsDto
                {
                    Position = m.Interview.Application.JobListing.Title,
                    DateDisplay = m.Interview.ScheduledAt.ToString("dddd, MMMM dd, yyyy"),
                    TimeDisplay = m.Interview.ScheduledAt.ToString("h:mm tt") + " – " + m.Interview.ScheduledAt.AddMinutes(m.Interview.DurationMinutes).ToString("h:mm tt"),
                    Format = m.Interview.Format.ToString() + (m.Interview.Location != null ? " · " + m.Interview.Location : "")
                } : null
            })
            .ToListAsync(ct);

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
