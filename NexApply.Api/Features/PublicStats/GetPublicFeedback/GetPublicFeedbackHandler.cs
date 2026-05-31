using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Data;
using NexApply.Contracts.Common;
using NexApply.Contracts.PublicStats;

namespace NexApply.Api.Features.PublicStats.GetPublicFeedback;

public class GetPublicFeedbackHandler : IRequestHandler<GetPublicFeedbackQuery, Result<List<PublicFeedbackDto>>>
{
    private readonly AppDbContext _context;

    public GetPublicFeedbackHandler(AppDbContext context) => _context = context;

    public async Task<Result<List<PublicFeedbackDto>>> Handle(GetPublicFeedbackQuery request, CancellationToken ct)
    {
        var studentFeedback = await _context.StudentProfiles
            .AsNoTracking()
            .Where(sp => !string.IsNullOrWhiteSpace(sp.Feedback))
            .Select(sp => new PublicFeedbackDto(
                sp.FullName,
                sp.University ?? "Student",
                sp.Feedback!.Trim()
            ))
            .ToListAsync(ct);

        var companyFeedback = await (
            from settings in _context.CompanyUserSettings.AsNoTracking()
            where !string.IsNullOrWhiteSpace(settings.Testimonial)
            join profile in _context.CompanyProfiles.AsNoTracking()
                on settings.UserId equals profile.UserId into profiles
            from profile in profiles.DefaultIfEmpty()
            select new PublicFeedbackDto(
                profile != null && !string.IsNullOrWhiteSpace(profile.CompanyName) ? profile.CompanyName : "Company",
                (profile != null ? profile.HiringManagerTitle : null) ?? "Company",
                settings.Testimonial!.Trim()
            )
        ).ToListAsync(ct);

        var feedback = studentFeedback
            .Concat(companyFeedback)
            .OrderBy(_ => Random.Shared.Next())
            .Take(10)
            .ToList();

        return Result<List<PublicFeedbackDto>>.Success(feedback);
    }
}
