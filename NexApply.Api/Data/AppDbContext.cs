using Microsoft.EntityFrameworkCore;
using NexApply.Api.Entities;
using NexApply.Api.Entities.Enums;

namespace NexApply.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<CompanyProfile> CompanyProfiles => Set<CompanyProfile>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<JobListing> JobListings => Set<JobListing>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<SavedJob> SavedJobs => Set<SavedJob>();
    public DbSet<Resume> Resumes => Set<Resume>();
    public DbSet<Interview> Interviews => Set<Interview>();
    public DbSet<InterviewPanelist> InterviewPanelists => Set<InterviewPanelist>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<NotificationState> NotificationStates => Set<NotificationState>();
    public DbSet<CompanyUserSettings> CompanyUserSettings => Set<CompanyUserSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

  
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).IsRequired().HasMaxLength(256);
            e.Property(u => u.Username).IsRequired().HasMaxLength(100);
            e.Property(u => u.PasswordHash).IsRequired();
            e.Property(u => u.Role).HasConversion<string>().IsRequired().HasMaxLength(20);
            e.Property(u => u.RefreshToken).HasMaxLength(500);
            e.Property(u => u.EmailVerificationCode).HasMaxLength(10);
            e.Property(u => u.PasswordResetCode).HasMaxLength(10);
            e.Property(u => u.CreatedAt).IsRequired();
        });


        modelBuilder.Entity<CompanyProfile>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.CompanyName).IsRequired().HasMaxLength(200);
            e.Property(c => c.Tagline).HasMaxLength(200);
            e.Property(c => c.Description).HasColumnType("text");
            e.Property(c => c.Mission).HasColumnType("text");
            e.Property(c => c.Website).HasMaxLength(500);
            e.Property(c => c.LogoUrl).HasColumnType("text");
            e.Property(c => c.Industry).HasMaxLength(100);
            e.Property(c => c.Location).HasMaxLength(200);
            e.Property(c => c.CompanySize).HasMaxLength(50);
            e.Property(c => c.Founded).HasMaxLength(50);
            e.Property(c => c.PerksAndBenefits).HasColumnType("text");
            e.Property(c => c.WorkCulture).HasMaxLength(500);
            e.Property(c => c.ContactEmail).HasMaxLength(256);
            e.Property(c => c.ContactPhone).HasMaxLength(50);
            e.Property(c => c.LinkedInUrl).HasMaxLength(500);
            e.Property(c => c.TwitterUrl).HasMaxLength(500);
            e.Property(c => c.FacebookUrl).HasMaxLength(500);
            e.Property(c => c.GitHubUrl).HasMaxLength(500);
            e.Property(c => c.HiringManagerName).HasMaxLength(200);
            e.Property(c => c.HiringManagerTitle).HasMaxLength(200);
            e.Property(c => c.HiringManagerEmail).HasMaxLength(256);
            e.Property(c => c.CreatedAt).IsRequired();

            e.HasOne(c => c.User)
             .WithOne(u => u.CompanyProfile)
             .HasForeignKey<CompanyProfile>(c => c.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });


        modelBuilder.Entity<StudentProfile>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.FullName).IsRequired().HasMaxLength(200);
            e.Property(s => s.Phone).HasMaxLength(50);
            e.Property(s => s.Location).HasMaxLength(200);
            e.Property(s => s.University).HasMaxLength(200);
            e.Property(s => s.Course).HasMaxLength(200);
            e.Property(s => s.LinkedIn).HasMaxLength(500);
            e.Property(s => s.GitHub).HasMaxLength(500);
            e.Property(s => s.Portfolio).HasMaxLength(500);
            e.Property(s => s.ResumeFilePath).HasMaxLength(500);
            e.Property(s => s.ParsedResumeText).HasColumnType("text");
            e.Property(s => s.Feedback).HasColumnType("text");
            e.Property(s => s.CreatedAt).IsRequired();

            e.HasOne(s => s.User)
             .WithOne(u => u.StudentProfile)
             .HasForeignKey<StudentProfile>(s => s.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });


        modelBuilder.Entity<JobListing>(e =>
        {
            e.HasKey(j => j.Id);
            e.Property(j => j.Title).IsRequired().HasMaxLength(300);
            e.Property(j => j.Description).IsRequired().HasColumnType("text");
            e.Property(j => j.Responsibilities).IsRequired().HasColumnType("text");
            e.Property(j => j.Qualifications).IsRequired().HasColumnType("text");
            e.Property(j => j.RequiredSkills).IsRequired().HasColumnType("text");
            e.Property(j => j.Benefits).HasColumnType("text");
            e.Property(j => j.Location).IsRequired().HasMaxLength(200);
            e.Property(j => j.JobType).IsRequired();
            e.Property(j => j.WorkSetup).IsRequired();
            e.Property(j => j.Status).IsRequired();
            e.Property(j => j.SalaryMin).HasColumnType("decimal(18,2)");
            e.Property(j => j.SalaryMax).HasColumnType("decimal(18,2)");
            e.Property(j => j.ExperienceLevel).HasMaxLength(50);
            e.Property(j => j.CreatedAt).IsRequired();

            e.HasOne(j => j.Company)
             .WithMany()
             .HasForeignKey(j => j.CompanyId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(j => j.CreatedAt);
            e.HasIndex(j => j.Status);
        });

  
        modelBuilder.Entity<Application>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.CoverLetter).HasColumnType("text");
            e.Property(a => a.ResumeUrl).HasMaxLength(500);
            e.Property(a => a.Status).IsRequired();
            e.Property(a => a.RecruiterNotes).HasColumnType("text");
            e.Property(a => a.CreatedAt).IsRequired();

            e.HasIndex(a => new { a.StudentId, a.JobListingId }).IsUnique();
            e.HasIndex(a => a.Status);

            e.HasOne(a => a.Student)
             .WithMany(s => s.Applications)
             .HasForeignKey(a => a.StudentId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(a => a.JobListing)
             .WithMany(j => j.Applications)
             .HasForeignKey(a => a.JobListingId)
             .OnDelete(DeleteBehavior.Restrict);
        });

    
        modelBuilder.Entity<SavedJob>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.CreatedAt).IsRequired();

            e.HasIndex(s => new { s.StudentId, s.JobListingId }).IsUnique();

            e.HasOne(s => s.Student)
             .WithMany(st => st.SavedJobs)
             .HasForeignKey(s => s.StudentId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(s => s.JobListing)
             .WithMany(j => j.SavedByStudents)
             .HasForeignKey(s => s.JobListingId)
             .OnDelete(DeleteBehavior.Cascade);
        });

  
        modelBuilder.Entity<Resume>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Headline).HasMaxLength(200);
            e.Property(r => r.AboutMe).HasColumnType("text");
            e.Property(r => r.EducationJson).HasColumnType("text").IsRequired();
            e.Property(r => r.WorkExperienceJson).HasColumnType("text").IsRequired();
            e.Property(r => r.SkillsJson).HasColumnType("text").IsRequired();
            e.Property(r => r.CreatedAt).IsRequired();

            e.HasOne(r => r.StudentProfile)
             .WithOne(s => s.Resume)
             .HasForeignKey<Resume>(r => r.StudentProfileId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(r => r.StudentProfileId).IsUnique();
        });

        modelBuilder.Entity<Interview>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.ScheduledAt).IsRequired();
            e.Property(i => i.DurationMinutes).IsRequired();
            e.Property(i => i.Format).IsRequired();
            e.Property(i => i.Status).IsRequired();
            e.Property(i => i.Location).HasMaxLength(500);
            e.Property(i => i.MeetingLink).HasMaxLength(1000);
            e.Property(i => i.Notes).HasColumnType("text");
            e.Property(i => i.Feedback).HasColumnType("text");
            e.Property(i => i.Recommendation).HasMaxLength(100);
            e.Property(i => i.CreatedAt).IsRequired();

            e.HasOne(i => i.Application)
             .WithMany()
             .HasForeignKey(i => i.ApplicationId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(i => i.ScheduledAt);
            e.HasIndex(i => i.Status);
        });

        modelBuilder.Entity<InterviewPanelist>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Name).IsRequired().HasMaxLength(200);
            e.Property(p => p.Title).HasMaxLength(200);
            e.Property(p => p.Email).HasMaxLength(256);
            e.Property(p => p.CreatedAt).IsRequired();

            e.HasOne(p => p.Interview)
             .WithMany(i => i.Panelists)
             .HasForeignKey(p => p.InterviewId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Message>(e =>
        {
            e.HasKey(m => m.Id);
            e.Property(m => m.Content).IsRequired().HasColumnType("text");
            e.Property(m => m.Type).IsRequired().HasMaxLength(50);
            e.Property(m => m.CreatedAt).IsRequired();

            e.HasOne(m => m.Sender)
             .WithMany()
             .HasForeignKey(m => m.SenderId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(m => m.Receiver)
             .WithMany()
             .HasForeignKey(m => m.ReceiverId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(m => m.Interview)
             .WithMany()
             .HasForeignKey(m => m.InterviewId)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasIndex(m => new { m.SenderId, m.ReceiverId });
            e.HasIndex(m => m.CreatedAt);
        });

        modelBuilder.Entity<NotificationState>(e =>
        {
            e.HasKey(n => n.Id);
            e.Property(n => n.NotificationId).IsRequired().HasMaxLength(300);
            e.Property(n => n.CreatedAt).IsRequired();
            e.HasIndex(n => new { n.StudentId, n.NotificationId }).IsUnique();
            e.HasIndex(n => n.StudentId);
        });

        modelBuilder.Entity<CompanyUserSettings>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.UserId).IsRequired();
            e.Property(s => s.ApplicantUpdatesEnabled).IsRequired().HasDefaultValue(true);
            e.Property(s => s.WeeklyDigestEnabled).IsRequired().HasDefaultValue(false);
            e.Property(s => s.CreatedAt).IsRequired();

            e.HasIndex(s => s.UserId).IsUnique();

            e.HasOne(s => s.User)
             .WithOne()
             .HasForeignKey<CompanyUserSettings>(s => s.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
