using NexApply.Api.Domain;

namespace NexApply.Api.Features.JobListings;

public sealed class JobListingResponse
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Responsibilities { get; init; } = string.Empty;
    public string Qualifications { get; init; } = string.Empty;
    public string RequiredSkills { get; init; } = string.Empty;
    public string? Benefits { get; init; }
    public string Location { get; init; } = string.Empty;
    public int JobType { get; init; }
    public int WorkSetup { get; init; }
    public decimal? SalaryMin { get; init; }
    public decimal? SalaryMax { get; init; }
    public string? ExperienceLevel { get; init; }
    public int Openings { get; init; }
    public DateTime? Deadline { get; init; }
    public int Status { get; init; }
    public DateTime CreatedAt { get; init; }

    public static JobListingResponse From(JobListing jobListing) => new()
    {
        Id = jobListing.Id,
        Title = jobListing.Title,
        Description = jobListing.Description,
        Responsibilities = jobListing.Responsibilities,
        Qualifications = jobListing.Qualifications,
        RequiredSkills = jobListing.RequiredSkills,
        Benefits = jobListing.Benefits,
        Location = jobListing.Location,
        JobType = (int)jobListing.JobType,
        WorkSetup = (int)jobListing.WorkSetup,
        SalaryMin = jobListing.SalaryMin,
        SalaryMax = jobListing.SalaryMax,
        ExperienceLevel = jobListing.ExperienceLevel,
        Openings = jobListing.Openings,
        Deadline = jobListing.Deadline,
        Status = (int)jobListing.Status,
        CreatedAt = jobListing.CreatedAt
    };
}
