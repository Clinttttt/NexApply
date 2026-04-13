using NexApply.Api.Entities.Enums;

namespace NexApply.Api.Entities;

public class User : BaseEntity
{
    public string Email { get; private set; } = string.Empty;
    public string Username { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiry { get; private set; }
    public UserRole Role { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Navigation properties
    public CompanyProfile? CompanyProfile { get; private set; }
    public StudentProfile? StudentProfile { get; private set; }

    private User() { } // EF Core

    public static User CreateStudent(string email, string username, string passwordHash)
    {
        return new User
        {
            Email = email,
            Username = username,
            PasswordHash = passwordHash,
            Role = UserRole.Student
        };
    }

    public static User CreateCompany(string email, string username, string passwordHash)
    {
        return new User
        {
            Email = email,
            Username = username,
            PasswordHash = passwordHash,
            Role = UserRole.Company
        };
    }

    public void UpdateRefreshToken(string token, DateTime expiry)
    {
        RefreshToken = token;
        RefreshTokenExpiry = expiry;
        MarkAsUpdated();
    }

    public void ClearRefreshToken()
    {
        RefreshToken = null;
        RefreshTokenExpiry = null;
        MarkAsUpdated();
    }

    public void Deactivate()
    {
        IsActive = false;
        MarkAsUpdated();
    }

    public void Activate()
    {
        IsActive = true;
        MarkAsUpdated();
    }
}
