namespace NexApply.Api.Features.Profile;

public sealed class StudentProfileResponse
{
    public string FullName { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? Location { get; init; }
    public string? University { get; init; }
    public string? Course { get; init; }
    public int? GraduationYear { get; init; }
    public string? LinkedIn { get; init; }
    public string? GitHub { get; init; }
    public string? Portfolio { get; init; }
    public string? ResumeFilePath { get; init; }
    public string? ProfilePictureUrl { get; init; }
}
