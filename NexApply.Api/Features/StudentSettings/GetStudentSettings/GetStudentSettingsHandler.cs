using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.StudentSettings;

namespace NexApply.Api.Features.StudentSettings.GetStudentSettings;

public class GetStudentSettingsHandler : IRequestHandler<GetStudentSettingsQuery, Result<StudentSettingsDto>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public GetStudentSettingsHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<StudentSettingsDto>> Handle(GetStudentSettingsQuery request, CancellationToken ct)
    {
        var userId = Guid.Parse(_currentUser.UserId);

        var user = await _context.Users
            .Include(u => u.StudentProfile)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user is null)
            return Result<StudentSettingsDto>.NotFound("User not found");

        var hasPassword = !string.IsNullOrWhiteSpace(user.PasswordHash);

        return Result<StudentSettingsDto>.Success(new StudentSettingsDto
        {
            Email = user.Email,
            HasPassword = hasPassword,
            SignInMethod = hasPassword ? "Email & Password" : "Google One Tap",
            Feedback = user.StudentProfile?.Feedback
        });
    }
}

