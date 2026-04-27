namespace NexApply.Contracts.JobListings;

public class JobListingDetailsDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Responsibilities { get; set; } = string.Empty;
    public string Qualifications { get; set; } = string.Empty;
    public string RequiredSkills { get; set; } = string.Empty;
    public string? Benefits { get; set; }
    public string Location { get; set; } = string.Empty;
    public string JobType { get; set; } = string.Empty;
    public string WorkSetup { get; set; } = string.Empty;
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? ExperienceLevel { get; set; }
    public int Openings { get; set; }
    public DateTime? Deadline { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    // Company info
    public string CompanyName { get; set; } = string.Empty;
    public string? CompanyLogoUrl { get; set; }
    
    // Stats
    public int TotalApplicants { get; set; }
    public int DaysLeft { get; set; }
    public int ShortlistedCount { get; set; }
    
    // Applicant breakdown by status
    public int SubmittedCount { get; set; }
    public int UnderReviewCount { get; set; }
    public int ForInterviewCount { get; set; }
    public int DeclinedCount { get; set; }
}
