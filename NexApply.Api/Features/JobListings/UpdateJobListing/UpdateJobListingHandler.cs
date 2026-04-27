using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities.Enums;
using NexApply.Api.Services;
using NexApply.Contracts.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.UpdateJobListing;

public class UpdateJobListingHandler : IRequestHandler<UpdateJobListingCommand, Result<JobListingDto>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public UpdateJobListingHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<JobListingDto>> Handle(UpdateJobListingCommand request, CancellationToken ct)
    {
        var companyId = Guid.Parse(_currentUser.UserId);

        var jobListing = await _context.JobListings
            .FirstOrDefaultAsync(j => j.Id == request.Id, ct);

        if (jobListing is null)
            return Result<JobListingDto>.NotFound();

        if (jobListing.CompanyId != companyId)
            return Result<JobListingDto>.Forbidden();

        jobListing.Update(
            request.Title,
            request.Description,
            request.Responsibilities,
            request.Qualifications,
            request.RequiredSkills,
            request.Benefits,
            request.Location,
            (JobType)request.JobType,
            (WorkSetup)request.WorkSetup,
            request.SalaryMin,
            request.SalaryMax,
            request.ExperienceLevel,
            request.Openings,
            request.Deadline
        );

        await _context.SaveChangesAsync(ct);

        var dto = new JobListingDto
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

        return Result<JobListingDto>.Success(dto);
    }
}
