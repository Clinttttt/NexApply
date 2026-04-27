namespace NexApply.Contracts.JobListings;

public class JobListingDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Responsibilities { get; set; } = string.Empty;
    public string Qualifications { get; set; } = string.Empty;
    public string RequiredSkills { get; set; } = string.Empty;
    public string? Benefits { get; set; }
    public string Location { get; set; } = string.Empty;
    public int JobType { get; set; }
    public int WorkSetup { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? ExperienceLevel { get; set; }
    public int Openings { get; set; }
    public DateTime? Deadline { get; set; }
    public int Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
