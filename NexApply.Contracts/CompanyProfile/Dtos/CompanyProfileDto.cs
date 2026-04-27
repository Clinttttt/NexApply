namespace NexApply.Contracts.CompanyProfile.Dtos;

public class CompanyProfileDto
{
    public Guid Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? Tagline { get; set; }
    public string? Description { get; set; }
    public string? Mission { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public string? Industry { get; set; }
    public string? Location { get; set; }
    public string? CompanySize { get; set; }
    public string? Founded { get; set; }
    public string? PerksAndBenefits { get; set; }
    public string? WorkCulture { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? TwitterUrl { get; set; }
    public string? FacebookUrl { get; set; }
    public string? GitHubUrl { get; set; }
    public string? HiringManagerName { get; set; }
    public string? HiringManagerTitle { get; set; }
    public string? HiringManagerEmail { get; set; }
    public int ActiveListingsCount { get; set; }
}
