namespace NexApply.Contracts.SavedJobs;

public class SavedJobDto
{
    public Guid SavedJobId { get; set; }
    public Guid JobListingId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;

    public string JobType { get; set; } = string.Empty;
    public string WorkSetup { get; set; } = string.Empty;
    public string Salary { get; set; } = string.Empty;

    public DateTime PostedAt { get; set; }
    public DateTime SavedAt { get; set; }

    public bool HasApplied { get; set; }

    public List<string> Skills { get; set; } = [];
    public string Description { get; set; } = string.Empty;
}

