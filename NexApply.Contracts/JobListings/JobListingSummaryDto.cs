namespace NexApply.Contracts.JobListings;

public class JobListingSummaryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int JobType { get; set; }
    public int WorkSetup { get; set; }
    public int Status { get; set; }
    public int TotalApplicants { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? Deadline { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string RequiredSkills { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    // Applicant breakdown
    public int SubmittedCount { get; set; }
    public int UnderReviewCount { get; set; }
    public int ShortlistedCount { get; set; }
    public int ForInterviewCount { get; set; }
}
