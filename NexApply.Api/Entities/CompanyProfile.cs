namespace NexApply.Api.Entities
{
    public class CompanyProfile
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public string? CompanyName { get; set; } 

        public string? Description { get; set; }

        public string? Website { get; set; }

        public string? LogoUrl { get; set; }

        public string? Industry { get; set; }

        public string? Location { get; set; }

        // Navigation properties
        public User User { get; set; } = null!;
        public ICollection<JobListing> JobListings { get; set; } = [];
    }

}
