namespace NexApply.Api.Entities;

public class CompanyUserSettings : BaseEntity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = default!;

    public bool ApplicantUpdatesEnabled { get; private set; } = true;
    public bool WeeklyDigestEnabled { get; private set; } = false;

    private CompanyUserSettings() { } // EF Core

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
}

