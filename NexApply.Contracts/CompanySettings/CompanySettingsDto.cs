namespace NexApply.Contracts.CompanySettings;

public class CompanySettingsDto
{
    public bool ApplicantUpdatesEnabled { get; set; }
    public bool WeeklyDigestEnabled { get; set; }
    public string? Testimonial { get; set; }

    public string Email { get; set; } = string.Empty;
    public string SignInMethod { get; set; } = "Email";
    public bool HasPassword { get; set; }
}
