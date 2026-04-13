using NexApply.Api.Entities.Enums;

namespace NexApply.Api.Entities;

public class Application : BaseEntity
{
    public Guid StudentId { get; private set; }
    public Guid JobListingId { get; private set; }
    public string? CoverLetter { get; private set; }
    public string? ResumeUrl { get; private set; }
    public ApplicationStatus Status { get; private set; } = ApplicationStatus.Submitted;
    public string? RecruiterNotes { get; private set; }

    // Navigation properties
    public StudentProfile Student { get; private set; } = null!;
    public JobListing JobListing { get; private set; } = null!;

    private Application() { } // EF Core

    public static Application Create(
        Guid studentId,
        Guid jobListingId,
        string? coverLetter,
        string? resumeUrl)
    {
        return new Application
        {
            StudentId = studentId,
            JobListingId = jobListingId,
            CoverLetter = coverLetter,
            ResumeUrl = resumeUrl
        };
    }

    public void MoveToUnderReview()
    {
        Status = ApplicationStatus.UnderReview;
        MarkAsUpdated();
    }

    public void Shortlist()
    {
        Status = ApplicationStatus.Shortlisted;
        MarkAsUpdated();
    }

    public void MoveToInterview()
    {
        Status = ApplicationStatus.ForInterview;
        MarkAsUpdated();
    }

    public void Decline()
    {
        Status = ApplicationStatus.Declined;
        MarkAsUpdated();
    }

    public void UpdateRecruiterNotes(string notes)
    {
        RecruiterNotes = notes;
        MarkAsUpdated();
    }
}
