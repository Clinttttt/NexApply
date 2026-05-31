namespace NexApply.Contracts.StudentSettings;

public class StudentSettingsDto
{
    public string Email { get; set; } = string.Empty;
    public bool HasPassword { get; set; }
    public string SignInMethod { get; set; } = "Email & Password";
    public string? Feedback { get; set; }
}

