namespace NexApply.Api.Domain.Enums;

public static class JobTypeExtensions
{
    public static string ToDisplayName(this JobType jobType) => jobType switch
    {
        JobType.FullTime => "Full-time",
        JobType.PartTime => "Part-time",
        JobType.Internship => "Internship",
        JobType.Freelance => "Freelance",
        JobType.Remote => "Remote",
        _ => jobType.ToString()
    };
}
