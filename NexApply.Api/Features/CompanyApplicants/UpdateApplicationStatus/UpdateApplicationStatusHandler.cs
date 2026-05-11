using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyApplicants;

namespace NexApply.Api.Features.CompanyApplicants.UpdateApplicationStatus;

public class UpdateApplicationStatusHandler : IRequestHandler<UpdateApplicationStatusCommand, Result<bool>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public UpdateApplicationStatusHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(UpdateApplicationStatusCommand request, CancellationToken ct)
    {
        var companyId = Guid.Parse(_currentUser.UserId);

        var application = await _context.Applications
            .Include(a => a.JobListing)
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId, ct);

        if (application is null)
            return Result<bool>.NotFound();

        if (application.JobListing.CompanyId != companyId)
            return Result<bool>.Forbidden();

        if (!Enum.TryParse<ApplicationStatus>(request.Status, ignoreCase: true, out var status))
            return Result<bool>.Failure("Invalid application status.");

        switch (status)
        {
            case ApplicationStatus.Submitted:
                application.MarkAsSubmitted();
                break;
            case ApplicationStatus.UnderReview:
                application.MoveToUnderReview();
                break;
            case ApplicationStatus.Shortlisted:
                application.Shortlist();
                break;
            case ApplicationStatus.ForInterview:
                application.MoveToInterview();
                break;
            case ApplicationStatus.Declined:
                application.Decline();
                break;
            default:
                return Result<bool>.Failure("Invalid application status.");
        }

        await _context.SaveChangesAsync(ct);

        return Result<bool>.Success(true);
    }
}
