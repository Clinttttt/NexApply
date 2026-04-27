using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.JobListings;

public record UpdateJobListingCommand(
    Guid Id,
    string Title,
    string Description,
    string Responsibilities,
    string Qualifications,
    string RequiredSkills,
    string? Benefits,
    string Location,
    int JobType,
    int WorkSetup,
    decimal? SalaryMin,
    decimal? SalaryMax,
    string? ExperienceLevel,
    int Openings,
    DateTime? Deadline
) : IRequest<Result<JobListingDto>>;
