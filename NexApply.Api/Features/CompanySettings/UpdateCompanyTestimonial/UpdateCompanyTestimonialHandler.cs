using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanySettings;

namespace NexApply.Api.Features.CompanySettings.UpdateCompanyTestimonial;

public class UpdateCompanyTestimonialHandler : IRequestHandler<UpdateCompanyTestimonialCommand, Result<CompanySettingsDto>>
{
    private readonly AppDbContext _context;
    private readonly CurrentUser _currentUser;

    public UpdateCompanyTestimonialHandler(AppDbContext context, CurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CompanySettingsDto>> Handle(UpdateCompanyTestimonialCommand request, CancellationToken ct)
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

        settings.UpdateTestimonial(string.IsNullOrWhiteSpace(request.Testimonial) ? null : request.Testimonial.Trim());
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

