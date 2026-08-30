using NexApply.Api.Domain.Common;

namespace NexApply.Api.Domain;

public class SavedJob : Entity
{
    public Guid StudentId { get; private set; }
    public Guid JobListingId { get; private set; }

    public StudentProfile Student { get; private set; } = null!;
    public JobListing JobListing { get; private set; } = null!;

    private SavedJob() { }

    public static SavedJob Create(Guid studentId, Guid jobListingId)
    {
        return new SavedJob
        {
            StudentId = studentId,
            JobListingId = jobListingId
        };
    }
}
