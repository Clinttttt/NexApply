namespace NexApply.Api.Features.CompanyApplicants;

public sealed class ApplicantResponse
{
    public Guid ApplicationId { get; init; }
    public Guid StudentId { get; init; }
    public string StudentName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? Location { get; init; }
    public string? Portfolio { get; init; }
    public string? LinkedIn { get; init; }
    public string? GitHub { get; init; }
    public string? ResumeUrl { get; init; }
    public Guid JobListingId { get; init; }
    public string JobTitle { get; init; } = string.Empty;
    public string JobType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public int? MatchScore { get; init; }
    public DateTime AppliedAt { get; init; }
    public string? CoverLetter { get; init; }
    public string? RecruiterNotes { get; init; }
    public List<string> Skills { get; init; } = [];
}
