using static System.Net.Mime.MediaTypeNames;

namespace NexApply.Api.Entities
{
    public enum JobListingStatus
    {
        Pending,
        Approved,
        Rejected
    }

    public enum JobType
    {
        FullTime,
        PartTime,
        Internship,
        Freelance,
        Remote
    }

    public class JobListing
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid CompanyId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Comma-separated or free-text required skills.
        /// Used together with Description for PostgreSQL full-text search matching.
        /// </summary>
        public string RequiredSkills { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public JobType JobType { get; set; }

        /// <summary>
        /// Status flow: Pending → Approved | Rejected
        /// </summary>
        public JobListingStatus Status { get; set; } = JobListingStatus.Pending;

        public DateTime? Deadline { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public CompanyProfile Company { get; set; } = null!;
        public ICollection<Application> Applications { get; set; } = [];
    }

}
