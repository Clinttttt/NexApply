using CompanyProfileEntity = NexApply.Api.Domain.CompanyProfile;

namespace NexApply.Api.Features.CompanyProfile;

public sealed class CompanyProfileResponse
{
    public Guid Id { get; init; }
    public string CompanyName { get; init; } = string.Empty;
    public string? Tagline { get; init; }
    public string? Description { get; init; }
    public string? Mission { get; init; }
    public string? Website { get; init; }
    public string? LogoUrl { get; init; }
    public string? Industry { get; init; }
    public string? Location { get; init; }
    public string? CompanySize { get; init; }
    public string? Founded { get; init; }
    public string? PerksAndBenefits { get; init; }
    public string? WorkCulture { get; init; }
    public string? ContactEmail { get; init; }
    public string? ContactPhone { get; init; }
    public string? LinkedInUrl { get; init; }
    public string? TwitterUrl { get; init; }
    public string? FacebookUrl { get; init; }
    public string? GitHubUrl { get; init; }
    public string? HiringManagerName { get; init; }
    public string? HiringManagerTitle { get; init; }
    public string? HiringManagerEmail { get; init; }
    public int ActiveListingsCount { get; init; }

    public static CompanyProfileResponse From(CompanyProfileEntity profile, int activeListingsCount) => new()
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
}
