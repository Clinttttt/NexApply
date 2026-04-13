namespace NexApply.Api.Entities;

public class SavedJob : BaseEntity
{
    public Guid StudentId { get; private set; }
    public Guid JobListingId { get; private set; }

    // Navigation properties
    public StudentProfile Student { get; private set; } = null!;
    public JobListing JobListing { get; private set; } = null!;

    private SavedJob() { } // EF Core

    public static SavedJob Create(Guid studentId, Guid jobListingId)
    {
        return new SavedJob
        {
            StudentId = studentId,
            JobListingId = jobListingId
        };
    }
}
