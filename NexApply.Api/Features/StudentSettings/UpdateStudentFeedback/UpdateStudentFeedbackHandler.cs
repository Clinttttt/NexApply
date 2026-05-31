using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.StudentSettings;

namespace NexApply.Api.Features.StudentSettings.UpdateStudentFeedback;

public class UpdateStudentFeedbackHandler : IRequestHandler<UpdateStudentFeedbackCommand, Result<bool>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public UpdateStudentFeedbackHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(UpdateStudentFeedbackCommand request, CancellationToken ct)
    {
        var userId = Guid.Parse(_currentUser.UserId);
        
        var profile = await _context.StudentProfiles
            .FirstOrDefaultAsync(sp => sp.UserId == userId, ct);

        if (profile == null)
            return Result<bool>.Failure("Student profile not found");

        profile.UpdateFeedback(request.Feedback);
        await _context.SaveChangesAsync(ct);

        return Result<bool>.Success(true);
    }
}
