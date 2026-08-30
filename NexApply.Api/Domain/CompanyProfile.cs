using NexApply.Api.Domain.Common;

namespace NexApply.Api.Domain;

public class CompanyProfile : Entity
{
    public Guid UserId { get; private set; }
    public string CompanyName { get; private set; } = string.Empty;
    public string? Tagline { get; private set; }
    public string? Description { get; private set; }
    public string? Mission { get; private set; }
    public string? Website { get; private set; }
    public string? LogoUrl { get; private set; }
    public string? Industry { get; private set; }
    public string? Location { get; private set; }
    public string? CompanySize { get; private set; }
    public string? Founded { get; private set; }
    public string? PerksAndBenefits { get; private set; }
    public string? WorkCulture { get; private set; }
    public string? ContactEmail { get; private set; }
    public string? ContactPhone { get; private set; }
    public string? LinkedInUrl { get; private set; }
    public string? TwitterUrl { get; private set; }
    public string? FacebookUrl { get; private set; }
    public string? GitHubUrl { get; private set; }
    public string? HiringManagerName { get; private set; }
    public string? HiringManagerTitle { get; private set; }
    public string? HiringManagerEmail { get; private set; }

    public User User { get; private set; } = null!;

    private CompanyProfile() { }

    public static CompanyProfile Create(Guid userId, string companyName)
    {
        return new CompanyProfile
        {
            UserId = userId,
            CompanyName = companyName
        };
    }

    public void UpdateProfile(
        string companyName,
        string? tagline,
        string? description,
        string? mission,
        string? website,
        string? logoUrl,
        string? industry,
        string? location,
        string? companySize,
        string? founded,
        string? perksAndBenefits,
        string? workCulture,
        string? contactEmail,
        string? contactPhone,
        string? linkedInUrl,
        string? twitterUrl,
        string? facebookUrl,
        string? gitHubUrl,
        string? hiringManagerName,
        string? hiringManagerTitle,
        string? hiringManagerEmail)
    {
        CompanyName = companyName;
        Tagline = tagline;
        Description = description;
        Mission = mission;
        Website = website;
        LogoUrl = logoUrl;
        Industry = industry;
        Location = location;
        CompanySize = companySize;
        Founded = founded;
        PerksAndBenefits = perksAndBenefits;
        WorkCulture = workCulture;
        ContactEmail = contactEmail;
        ContactPhone = contactPhone;
        LinkedInUrl = linkedInUrl;
        TwitterUrl = twitterUrl;
        FacebookUrl = facebookUrl;
        GitHubUrl = gitHubUrl;
        HiringManagerName = hiringManagerName;
        HiringManagerTitle = hiringManagerTitle;
        HiringManagerEmail = hiringManagerEmail;
        MarkAsUpdated();
    }
}
