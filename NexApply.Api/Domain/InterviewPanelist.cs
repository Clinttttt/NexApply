using NexApply.Api.Domain.Common;

namespace NexApply.Api.Domain;

public class InterviewPanelist : Entity
{
    public Guid InterviewId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Title { get; private set; }
    public string? Email { get; private set; }

    public Interview Interview { get; private set; } = null!;

    private InterviewPanelist() { }

    public static InterviewPanelist Create(Guid interviewId, string name, string? title, string? email)
    {
        return new InterviewPanelist
        {
            InterviewId = interviewId,
            Name = name,
            Title = title,
            Email = email
        };
    }
}
