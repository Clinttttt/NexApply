using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.JobListings;

namespace NexApply.Api.Features.JobListings.DeleteJobListing;

public class DeleteJobListingHandler : IRequestHandler<DeleteJobListingCommand, Result<bool>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public DeleteJobListingHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(DeleteJobListingCommand request, CancellationToken ct)
    {
        var companyId = Guid.Parse(_currentUser.UserId);

        var jobListing = await _context.JobListings
            .Include(j => j.Applications)
            .FirstOrDefaultAsync(j => j.Id == request.JobListingId, ct);

        if (jobListing is null)
            return Result<bool>.NotFound();

        if (jobListing.CompanyId != companyId)
            return Result<bool>.Forbidden();

        // Applications have DeleteBehavior.Restrict, so we must block deletion if any exist.
        if (jobListing.Applications.Count != 0)
        {
            return Result<bool>.Conflict("This listing has applications and cannot be deleted. Close it instead.");
        }

        _context.JobListings.Remove(jobListing);
        await _context.SaveChangesAsync(ct);

        return Result<bool>.Success(true);
    }
}

