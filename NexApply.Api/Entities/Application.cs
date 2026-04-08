namespace NexApply.Api.Entities
{
    public enum ApplicationStatus
    {
        Submitted,
        UnderReview,
        Shortlisted,
        ForInterview,
        Declined
    }

    public class Application
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid StudentId { get; set; }

        public Guid JobListingId { get; set; }

        public string? CoverLetter { get; set; }

        /// <summary>
        /// Snapshot of resume path at time of application.
        /// Stored separately from StudentProfile.ResumeFilePath
        /// so future resume uploads don't affect existing applications.
        /// </summary>
        public string? ResumeUrl { get; set; }

        /// <summary>
        /// Status flow: Submitted → UnderReview → Shortlisted → ForInterview | Declined
        /// </summary>
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Submitted;

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public StudentProfile Student { get; set; } = null!;
        public JobListing JobListing { get; set; } = null!;
    }
}
