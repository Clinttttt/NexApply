namespace NexApply.Api.Entities;

public class CompanyProfile : BaseEntity
{
    public Guid UserId { get; private set; }
    public string CompanyName { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? Website { get; private set; }
    public string? LogoUrl { get; private set; }
    public string? Industry { get; private set; }
    public string? Location { get; private set; }

    // Navigation properties
    public User User { get; private set; } = null!;
    public ICollection<JobListing> JobListings { get; private set; } = [];

    private CompanyProfile() { } // EF Core

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
        string? description,
        string? website,
        string? logoUrl,
        string? industry,
        string? location)
    {
        CompanyName = companyName;
        Description = description;
        Website = website;
        LogoUrl = logoUrl;
        Industry = industry;
        Location = location;
        MarkAsUpdated();
    }
}
