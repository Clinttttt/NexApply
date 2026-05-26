namespace NexApply.Contracts.Applications;

public class StudentApplicationDto
{
    public Guid ApplicationId { get; set; }
    public Guid JobListingId { get; set; }

    public string JobTitle { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;

    /// <summary>
    /// Display status text used by the UI (e.g., "Under Review", "For Interview").
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// UI pipeline step index for the current status (0..4).
    /// </summary>
    public int PipelineStage { get; set; }

    /// <summary>
    /// Display job type string used by the UI (e.g., "Full-time", "Internship").
    /// </summary>
    public string JobType { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; }
}

