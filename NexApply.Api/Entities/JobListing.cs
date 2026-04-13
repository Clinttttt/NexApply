using NexApply.Api.Entities.Enums;

namespace NexApply.Api.Entities;

public class JobListing : BaseEntity
{
    public Guid CompanyId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string Responsibilities { get; private set; } = string.Empty;
    public string Qualifications { get; private set; } = string.Empty;
    public string RequiredSkills { get; private set; } = string.Empty;
    public string? Benefits { get; private set; }
    public string Location { get; private set; } = string.Empty;
    public JobType JobType { get; private set; }
    public WorkSetup WorkSetup { get; private set; }
    public decimal? SalaryMin { get; private set; }
    public decimal? SalaryMax { get; private set; }
    public string? ExperienceLevel { get; private set; }
    public int Openings { get; private set; } = 1;
    public DateTime? Deadline { get; private set; }
    public JobListingStatus Status { get; private set; } = JobListingStatus.Active;

    // Navigation properties
    public CompanyProfile Company { get; private set; } = null!;
    public ICollection<Application> Applications { get; private set; } = [];
    public ICollection<SavedJob> SavedByStudents { get; private set; } = [];

    private JobListing() { } // EF Core

    public static JobListing Create(
        Guid companyId,
        string title,
        string description,
        string responsibilities,
        string qualifications,
        string requiredSkills,
        string location,
        JobType jobType,
        WorkSetup workSetup)
    {
        return new JobListing
        {
            CompanyId = companyId,
            Title = title,
            Description = description,
            Responsibilities = responsibilities,
            Qualifications = qualifications,
            RequiredSkills = requiredSkills,
            Location = location,
            JobType = jobType,
            WorkSetup = workSetup
        };
    }

    public void Update(
        string title,
        string description,
        string responsibilities,
        string qualifications,
        string requiredSkills,
        string? benefits,
        string location,
        JobType jobType,
        WorkSetup workSetup,
        decimal? salaryMin,
        decimal? salaryMax,
        string? experienceLevel,
        int openings,
        DateTime? deadline)
    {
        Title = title;
        Description = description;
        Responsibilities = responsibilities;
        Qualifications = qualifications;
        RequiredSkills = requiredSkills;
        Benefits = benefits;
        Location = location;
        JobType = jobType;
        WorkSetup = workSetup;
        SalaryMin = salaryMin;
        SalaryMax = salaryMax;
        ExperienceLevel = experienceLevel;
        Openings = openings;
        Deadline = deadline;
        MarkAsUpdated();
    }

    public void Pause()
    {
        Status = JobListingStatus.Paused;
        MarkAsUpdated();
    }

    public void Activate()
    {
        Status = JobListingStatus.Active;
        MarkAsUpdated();
    }

    public void Close()
    {
        Status = JobListingStatus.Closed;
        MarkAsUpdated();
    }
}
