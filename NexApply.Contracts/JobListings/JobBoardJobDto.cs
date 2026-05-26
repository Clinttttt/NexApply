namespace NexApply.Contracts.JobListings;

public class JobBoardJobDto
{
    public Guid Id { get; set; }

    public string Company { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;
    public string Setup { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;

    public DateTime PostedAt { get; set; }
    public int Applicants { get; set; }
    public string Salary { get; set; } = string.Empty;

    public List<string> Skills { get; set; } = [];
    public string About { get; set; } = string.Empty;
    public List<string> Responsibilities { get; set; } = [];
    public List<string> Requirements { get; set; } = [];
}

