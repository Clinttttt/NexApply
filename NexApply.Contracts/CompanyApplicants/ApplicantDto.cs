namespace NexApply.Contracts.CompanyApplicants;

public class ApplicantDto
{
    public Guid ApplicationId { get; set; }
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Location { get; set; }
    public string? Portfolio { get; set; }
    public string? LinkedIn { get; set; }
    public string? GitHub { get; set; }
    public string? ResumeUrl { get; set; }
    public Guid JobListingId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string JobType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? MatchScore { get; set; }
    public DateTime AppliedAt { get; set; }
    public string? CoverLetter { get; set; }
    public string? RecruiterNotes { get; set; }
    public List<string> Skills { get; set; } = new();
}
