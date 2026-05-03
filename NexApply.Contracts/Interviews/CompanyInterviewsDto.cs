namespace NexApply.Contracts.Interviews;

public class CompanyInterviewsDto
{
    public List<InterviewDto> Interviews { get; set; } = new();
}

public class InterviewDto
{
    public Guid Id { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; }
    public string Format { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? MeetingLink { get; set; }
    public List<string> Interviewers { get; set; } = new();
    public string? Notes { get; set; }
    public string? Feedback { get; set; }
    public int? Rating { get; set; }
    public string? Recommendation { get; set; }
}
