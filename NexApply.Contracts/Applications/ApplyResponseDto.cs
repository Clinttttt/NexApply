namespace NexApply.Contracts.Applications;

public class ApplyResponseDto
{
    public Guid ApplicationId { get; set; }
    public Guid JobListingId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; }
}
