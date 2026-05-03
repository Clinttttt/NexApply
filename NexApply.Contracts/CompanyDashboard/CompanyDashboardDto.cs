namespace NexApply.Contracts.CompanyDashboard;

public class CompanyDashboardDto
{
    public int AwaitingReview { get; set; }
    public int UpcomingInterviews { get; set; }
    public int UnreadMessages { get; set; }
    public List<RecentApplicantDto> RecentApplicants { get; set; } = new();
    public List<ActiveListingDto> ActiveListings { get; set; } = new();
}

public class RecentApplicantDto
{
    public Guid ApplicationId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; }
}

public class ActiveListingDto
{
    public Guid JobListingId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string JobType { get; set; } = string.Empty;
    public string WorkSetup { get; set; } = string.Empty;
    public int ApplicantCount { get; set; }
    public DateTime PostedAt { get; set; }
}
