namespace NexApply.Contracts.JobListings;

public class StudentBrowseJobDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string JobType { get; set; } = string.Empty;
    public string WorkSetup { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int MatchScore { get; set; }
    public DateTime PostedAt { get; set; }
    public int Applicants { get; set; }
    public string Salary { get; set; } = string.Empty;
    public string LogoText { get; set; } = string.Empty;
    public bool IsSaved { get; set; }
    public bool HasApplied { get; set; }
    public List<string> MatchedSkills { get; set; } = [];
    public List<string> MissingSkills { get; set; } = [];
    public List<string> Description { get; set; } = [];
    public List<string> Responsibilities { get; set; } = [];
    public List<string> Requirements { get; set; } = [];
}
