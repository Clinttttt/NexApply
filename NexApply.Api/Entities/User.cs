namespace NexApply.Api.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string? Username { get; set; } 
        public string? Email { get; set; } 
        public string? PasswordHash { get; set; } 

        public string? RefreshToken { get; set; }
        public DateTime RefreshTokenExpiry { get; set; }

        /// <summary>
        /// Values: "Company", "Student"
        /// </summary>
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


        // Navigation properties
        public CompanyProfile? CompanyProfile { get; set; }
        public StudentProfile? StudentProfile { get; set; }
    }

}
