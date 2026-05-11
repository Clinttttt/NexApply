using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyApplicants;

namespace NexApply.Api.Features.CompanyApplicants.UpdateApplicationNotes;

public class UpdateApplicationNotesHandler : IRequestHandler<UpdateApplicationNotesCommand, Result<bool>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public UpdateApplicationNotesHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(UpdateApplicationNotesCommand request, CancellationToken ct)
    {
        var companyId = Guid.Parse(_currentUser.UserId);

        var application = await _context.Applications
            .Include(a => a.JobListing)
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId, ct);

        if (application is null)
            return Result<bool>.NotFound();

        if (application.JobListing.CompanyId != companyId)
            return Result<bool>.Forbidden();

        application.UpdateRecruiterNotes(request.RecruiterNotes ?? string.Empty);

        await _context.SaveChangesAsync(ct);

        return Result<bool>.Success(true);
    }
}
