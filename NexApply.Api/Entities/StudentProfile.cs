using static System.Net.Mime.MediaTypeNames;

namespace NexApply.Api.Entities
{
    public class StudentProfile
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid UserId { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string? University { get; set; }

        public string? Course { get; set; }

        public int? GraduationYear { get; set; }

        /// <summary>
        /// Relative path to uploaded resume file.
        /// Stored at: wwwroot/uploads/resumes/{userId}/
        /// </summary>
        public string? ResumeFilePath { get; set; }

        /// <summary>
        /// Raw text extracted from uploaded resume (PDF or DOCX).
        /// Used by the PostgreSQL full-text search matching engine.
        /// </summary>
        public string? ParsedResumeText { get; set; }

        // Navigation properties
        public User User { get; set; } = null!;
        public ICollection<Application> Applications { get; set; } = [];
    }

}
