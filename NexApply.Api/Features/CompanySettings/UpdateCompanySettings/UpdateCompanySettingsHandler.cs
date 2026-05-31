using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanySettings;

namespace NexApply.Api.Features.CompanySettings.UpdateCompanySettings;

public class UpdateCompanySettingsHandler : IRequestHandler<UpdateCompanySettingsCommand, Result<CompanySettingsDto>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public UpdateCompanySettingsHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CompanySettingsDto>> Handle(UpdateCompanySettingsCommand request, CancellationToken ct)
    {
        var userId = Guid.Parse(_currentUser.UserId);

        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user is null)
            return Result<CompanySettingsDto>.NotFound("User not found");

        var settings = await _context.CompanyUserSettings
            .FirstOrDefaultAsync(s => s.UserId == userId, ct);

        if (settings is null)
        {
            settings = CompanyUserSettings.Create(userId);
            _context.CompanyUserSettings.Add(settings);
        }

        settings.UpdateNotificationPreferences(request.ApplicantUpdatesEnabled, request.WeeklyDigestEnabled);
        await _context.SaveChangesAsync(ct);

        var hasPassword = !string.IsNullOrWhiteSpace(user.PasswordHash);

        return Result<CompanySettingsDto>.Success(new CompanySettingsDto
        {
            ApplicantUpdatesEnabled = settings.ApplicantUpdatesEnabled,
            WeeklyDigestEnabled = settings.WeeklyDigestEnabled,
            Testimonial = settings.Testimonial,
            Email = user.Email,
            HasPassword = hasPassword,
            SignInMethod = hasPassword ? "Email & Password" : "Google One Tap"
        });
    }
}
