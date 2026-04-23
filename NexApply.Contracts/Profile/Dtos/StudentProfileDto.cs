namespace NexApply.Contracts.Profile.Dtos;

public class StudentProfileDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Location { get; set; }
    public string? University { get; set; }
    public string? Course { get; set; }
    public int? GraduationYear { get; set; }
    public string? LinkedIn { get; set; }
    public string? GitHub { get; set; }
    public string? Portfolio { get; set; }
    public string? ResumeFilePath { get; set; }
}
