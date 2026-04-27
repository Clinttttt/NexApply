using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.CreateJobListing;

public class CreateJobListingHandler(AppDbContext context, CurrentUser currentUser) : IRequestHandler<CreateJobListingCommand, Result<JobListingDto>>
{
    public async Task<Result<JobListingDto>> Handle(CreateJobListingCommand request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);

        var companyProfile = await context.CompanyProfiles
            .FirstOrDefaultAsync(c => c.UserId == userId, ct);

        if (companyProfile is null)
            return Result<JobListingDto>.NotFound();

        // Convert deadline to UTC if provided
        DateTime? deadlineUtc = request.Deadline.HasValue 
            ? DateTime.SpecifyKind(request.Deadline.Value, DateTimeKind.Utc)
            : null;

        var jobListing = JobListing.Create(
            companyProfile.Id,
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
            deadlineUtc
        );

        context.JobListings.Add(jobListing);
        
        try
        {
            await context.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex)
        {
            // Log the inner exception for debugging
            var innerMessage = ex.InnerException?.Message ?? ex.Message;
            return Result<JobListingDto>.Failure($"Database error: {innerMessage}", 500);
        }

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
