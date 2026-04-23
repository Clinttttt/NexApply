namespace NexApply.Api.Entities;

public class StudentProfile : BaseEntity
{
    public Guid UserId { get; private set; }
    public string FullName { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public string? Location { get; private set; }
    public string? University { get; private set; }
    public string? Course { get; private set; }
    public int? GraduationYear { get; private set; }
    public string? LinkedIn { get; private set; }
    public string? GitHub { get; private set; }
    public string? Portfolio { get; private set; }
    public string? ResumeFilePath { get; private set; }
    public string? ParsedResumeText { get; private set; }

    // Navigation properties
    public User User { get; private set; } = null!;
    public ICollection<Application> Applications { get; private set; } = [];
    public ICollection<SavedJob> SavedJobs { get; private set; } = [];
    public Resume? Resume { get; private set; }

    private StudentProfile() { } // EF Core

    public static StudentProfile Create(Guid userId, string fullName)
    {
        return new StudentProfile
        {
            UserId = userId,
            FullName = fullName
        };
    }

    public void UpdateProfile(
        string fullName,
        string? phone,
        string? location,
        string? university,
        string? course,
        int? graduationYear,
        string? linkedIn,
        string? gitHub,
        string? portfolio)
    {
        FullName = fullName;
        Phone = phone;
        Location = location;
        University = university;
        Course = course;
        GraduationYear = graduationYear;
        LinkedIn = linkedIn;
        GitHub = gitHub;
        Portfolio = portfolio;
        MarkAsUpdated();
    }

    public void UpdateResume(string filePath, string parsedText)
    {
        ResumeFilePath = filePath;
        ParsedResumeText = parsedText;
        MarkAsUpdated();
    }
}
