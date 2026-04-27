using MediatR;
using Microsoft.EntityFrameworkCore;
using NexApply.Api.Common;
using NexApply.Api.Data;
using NexApply.Api.Entities.Enums;
using NexApply.Contracts.Common;
using NexApply.Contracts.CompanyProfile.Dtos;
using NexApply.Contracts.CompanyProfile.Queries;

namespace NexApply.Api.Features.CompanyProfile.GetCompanyProfile;

public class GetCompanyProfileHandler(AppDbContext context, CurrentUser currentUser) : IRequestHandler<GetCompanyProfileQuery, Result<CompanyProfileDto>>
{
    public async Task<Result<CompanyProfileDto>> Handle(GetCompanyProfileQuery request, CancellationToken ct)
    {
        var userId = Guid.Parse(currentUser.UserId);

        var profile = await context.CompanyProfiles
            .FirstOrDefaultAsync(c => c.UserId == userId, ct);

        if (profile is null)
            return Result<CompanyProfileDto>.NotFound();

        var activeListingsCount = await context.JobListings
            .Where(j => j.CompanyId == userId && j.Status == JobListingStatus.Active)
            .CountAsync(ct);

        var dto = new CompanyProfileDto
        {
            Id = profile.Id,
            CompanyName = profile.CompanyName,
            Tagline = profile.Tagline,
            Description = profile.Description,
            Mission = profile.Mission,
            Website = profile.Website,
            LogoUrl = profile.LogoUrl,
            Industry = profile.Industry,
            Location = profile.Location,
            CompanySize = profile.CompanySize,
            Founded = profile.Founded,
            PerksAndBenefits = profile.PerksAndBenefits,
            WorkCulture = profile.WorkCulture,
            ContactEmail = profile.ContactEmail,
            ContactPhone = profile.ContactPhone,
            LinkedInUrl = profile.LinkedInUrl,
            TwitterUrl = profile.TwitterUrl,
            FacebookUrl = profile.FacebookUrl,
            GitHubUrl = profile.GitHubUrl,
            HiringManagerName = profile.HiringManagerName,
            HiringManagerTitle = profile.HiringManagerTitle,
            HiringManagerEmail = profile.HiringManagerEmail,
            ActiveListingsCount = activeListingsCount
        };

        return Result<CompanyProfileDto>.Success(dto);
    }
}
