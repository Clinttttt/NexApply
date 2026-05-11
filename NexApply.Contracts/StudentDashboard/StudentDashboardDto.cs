namespace NexApply.Contracts.StudentDashboard;

public class StudentDashboardDto
{
    public string StudentName { get; set; } = string.Empty;
    public int AppliedCount { get; set; }
    public int UnderReviewCount { get; set; }
    public int ShortlistedCount { get; set; }
    public int InterviewCount { get; set; }
    public int NewMatchesCount { get; set; }
    public int NewListingsTodayCount { get; set; }
    public int AwaitingUpdateCount { get; set; }
    public ResumeStrengthDto ResumeStrength { get; set; } = new();
    public List<StudentDashboardApplicationDto> RecentApplications { get; set; } = [];
    public List<StudentDashboardJobMatchDto> TopJobMatches { get; set; } = [];
}

public class StudentDashboardApplicationDto
{
    public Guid ApplicationId { get; set; }
    public Guid JobListingId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string WorkSetup { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; }
    public string LogoText { get; set; } = string.Empty;
}

public class StudentDashboardJobMatchDto
{
    public Guid JobListingId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string WorkSetup { get; set; } = string.Empty;
    public string JobType { get; set; } = string.Empty;
    public int MatchScore { get; set; }
    public List<string> MatchedSkills { get; set; } = [];
}

public class ResumeStrengthDto
{
    public int Score { get; set; }
    public bool HasWorkExperience { get; set; }
    public bool HasSkills { get; set; }
    public bool HasPortfolio { get; set; }
    public bool HasLatestResume { get; set; }
}
