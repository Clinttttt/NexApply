namespace NexApply.Api.Entities;

public class Message : BaseEntity
{
    public Guid SenderId { get; private set; }
    public Guid ReceiverId { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public string Type { get; private set; } = "text"; // text, interview-invite
    public bool IsRead { get; private set; } = false;
    public Guid? InterviewId { get; private set; }

    // Navigation
    public User Sender { get; private set; } = null!;
    public User Receiver { get; private set; } = null!;
    public Interview? Interview { get; private set; }

    private Message() { }

    public static Message CreateTextMessage(Guid senderId, Guid receiverId, string content)
    {
        return new Message
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Content = content,
            Type = "text"
        };
    }

    public static Message CreateInterviewInvite(Guid senderId, Guid receiverId, string content, Guid interviewId)
    {
        return new Message
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Content = content,
            Type = "interview-invite",
            InterviewId = interviewId
        };
    }

    public void MarkAsRead()
    {
        IsRead = true;
        MarkAsUpdated();
    }
}
