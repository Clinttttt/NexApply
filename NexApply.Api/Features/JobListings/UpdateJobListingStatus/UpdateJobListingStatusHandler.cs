using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities.Enums;
using NexApply.Api.Services;
using NexApply.Contracts.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.UpdateJobListingStatus;

public class UpdateJobListingStatusHandler : IRequestHandler<UpdateJobListingStatusCommand, Result<bool>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public UpdateJobListingStatusHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(UpdateJobListingStatusCommand request, CancellationToken ct)
    {
        var companyId = Guid.Parse(_currentUser.UserId);

        var jobListing = await _context.JobListings
            .FirstOrDefaultAsync(j => j.Id == request.JobListingId, ct);

        if (jobListing is null)
            return Result<bool>.NotFound();

        if (jobListing.CompanyId != companyId)
            return Result<bool>.Forbidden();

        var newStatus = (JobListingStatus)request.Status;

        switch (newStatus)
        {
            case JobListingStatus.Active:
                jobListing.Activate();
                break;
            case JobListingStatus.Paused:
                jobListing.Pause();
                break;
            case JobListingStatus.Closed:
                jobListing.Close();
                break;
            default:
                return Result<bool>.Failure("Invalid status value.");
        }

        await _context.SaveChangesAsync(ct);

        return Result<bool>.Success(true);
    }
}
