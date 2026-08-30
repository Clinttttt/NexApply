using NexApply.Api.Domain;

namespace NexApply.Api.Features.CompanySettings;

public sealed class CompanySettingsResponse
{
    private const string EmailAndPassword = "Email & Password";
    private const string GoogleOneTap = "Google One Tap";

    public bool ApplicantUpdatesEnabled { get; init; }
    public bool WeeklyDigestEnabled { get; init; }
    public string? Testimonial { get; init; }
    public string Email { get; init; } = string.Empty;
    public string SignInMethod { get; init; } = EmailAndPassword;
    public bool HasPassword { get; init; }

    public static CompanySettingsResponse From(User user, CompanyUserSettings settings)
    {
        var hasPassword = !string.IsNullOrWhiteSpace(user.PasswordHash);

        return new CompanySettingsResponse
        {
            ApplicantUpdatesEnabled = settings.ApplicantUpdatesEnabled,
            WeeklyDigestEnabled = settings.WeeklyDigestEnabled,
            Testimonial = settings.Testimonial,
            Email = user.Email,
            HasPassword = hasPassword,
            SignInMethod = hasPassword ? EmailAndPassword : GoogleOneTap
        };
    }
}
