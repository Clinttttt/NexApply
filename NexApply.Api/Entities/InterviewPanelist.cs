namespace NexApply.Api.Entities;

public class InterviewPanelist : BaseEntity
{
    public Guid InterviewId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Title { get; private set; }
    public string? Email { get; private set; }

    // Navigation properties
    public Interview Interview { get; private set; } = null!;

    private InterviewPanelist() { } // EF Core

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
