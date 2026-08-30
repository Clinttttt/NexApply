using NexApply.Api.Domain.Common;
using NexApply.Api.Domain.Enums;

namespace NexApply.Api.Domain;

public class Interview : Entity
{
    public Guid ApplicationId { get; private set; }
    public DateTime ScheduledAt { get; private set; }
    public int DurationMinutes { get; private set; }
    public InterviewFormat Format { get; private set; }
    public InterviewStatus Status { get; private set; } = InterviewStatus.Scheduled;
    public string? Location { get; private set; }
    public string? MeetingLink { get; private set; }
    public string? Notes { get; private set; }
    public string? Feedback { get; private set; }
    public int? Rating { get; private set; }
    public string? Recommendation { get; private set; }

    public Application Application { get; private set; } = null!;
    public List<InterviewPanelist> Panelists { get; private set; } = new();

    private Interview() { }

    public static Interview Create(
        Guid applicationId,
        DateTime scheduledAt,
        int durationMinutes,
        InterviewFormat format,
        string? location,
        string? meetingLink,
        string? notes)
    {
        return new Interview
        {
            ApplicationId = applicationId,
            ScheduledAt = scheduledAt,
            DurationMinutes = durationMinutes,
            Format = format,
            Location = location,
            MeetingLink = meetingLink,
            Notes = notes
        };
    }

    public void Reschedule(DateTime newScheduledAt, int durationMinutes)
    {
        ScheduledAt = newScheduledAt;
        DurationMinutes = durationMinutes;
        MarkAsUpdated();
    }

    public void UpdateDetails(InterviewFormat format, string? location, string? meetingLink, string? notes)
    {
        Format = format;
        Location = location;
        MeetingLink = meetingLink;
        Notes = notes;
        MarkAsUpdated();
    }

    public void MarkAsCompleted()
    {
        Status = InterviewStatus.Completed;
        MarkAsUpdated();
    }

    public void Cancel()
    {
        Status = InterviewStatus.Cancelled;
        MarkAsUpdated();
    }

    public void MarkAsNoShow()
    {
        Status = InterviewStatus.NoShow;
        MarkAsUpdated();
    }

    public void UpdateFeedback(string feedback, int? rating, string? recommendation)
    {
        Feedback = feedback;
        Rating = rating;
        Recommendation = recommendation;
        MarkAsUpdated();
    }

    public void UpdateNotes(string notes)
    {
        Notes = notes;
        MarkAsUpdated();
    }
}
