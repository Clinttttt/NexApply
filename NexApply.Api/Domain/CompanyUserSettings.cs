using NexApply.Api.Domain.Common;

namespace NexApply.Api.Domain;

public class CompanyUserSettings : Entity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = default!;

    public bool ApplicantUpdatesEnabled { get; private set; } = true;
    public bool WeeklyDigestEnabled { get; private set; } = false;
    public string? Testimonial { get; private set; }

    private CompanyUserSettings() { }

    public static CompanyUserSettings Create(Guid userId)
    {
        return new CompanyUserSettings
        {
            UserId = userId
        };
    }

    public void UpdateNotificationPreferences(bool applicantUpdatesEnabled, bool weeklyDigestEnabled)
    {
        ApplicantUpdatesEnabled = applicantUpdatesEnabled;
        WeeklyDigestEnabled = weeklyDigestEnabled;
        MarkAsUpdated();
    }

    public void UpdateTestimonial(string? testimonial)
    {
        Testimonial = testimonial;
        MarkAsUpdated();
    }
}
