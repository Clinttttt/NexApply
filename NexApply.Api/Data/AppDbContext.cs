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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).IsRequired().HasMaxLength(256);
            e.Property(u => u.Username).IsRequired().HasMaxLength(100);
            e.Property(u => u.PasswordHash).IsRequired();
            e.Property(u => u.Role).HasConversion<string>().IsRequired().HasMaxLength(20);
            e.Property(u => u.RefreshToken).HasMaxLength(500);
            e.Property(u => u.CreatedAt).IsRequired();
        });

        // CompanyProfile
        modelBuilder.Entity<CompanyProfile>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.CompanyName).IsRequired().HasMaxLength(200);
            e.Property(c => c.Description).HasColumnType("text");
            e.Property(c => c.Website).HasMaxLength(500);
            e.Property(c => c.LogoUrl).HasMaxLength(500);
            e.Property(c => c.Industry).HasMaxLength(100);
            e.Property(c => c.Location).HasMaxLength(200);
            e.Property(c => c.CreatedAt).IsRequired();

            e.HasOne(c => c.User)
             .WithOne(u => u.CompanyProfile)
             .HasForeignKey<CompanyProfile>(c => c.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // StudentProfile
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
            e.Property(s => s.CreatedAt).IsRequired();

            e.HasOne(s => s.User)
             .WithOne(u => u.StudentProfile)
             .HasForeignKey<StudentProfile>(s => s.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // JobListing
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
            e.Property(j => j.JobType).HasConversion<string>().IsRequired().HasMaxLength(20);
            e.Property(j => j.WorkSetup).HasConversion<string>().IsRequired().HasMaxLength(20);
            e.Property(j => j.SalaryMin).HasColumnType("decimal(18,2)");
            e.Property(j => j.SalaryMax).HasColumnType("decimal(18,2)");
            e.Property(j => j.ExperienceLevel).HasMaxLength(50);
            e.Property(j => j.Status).HasConversion<string>().IsRequired().HasMaxLength(20);
            e.Property(j => j.CreatedAt).IsRequired();

            e.HasOne(j => j.Company)
             .WithMany(c => c.JobListings)
             .HasForeignKey(j => j.CompanyId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(j => j.CreatedAt);
            e.HasIndex(j => j.Status);
        });

        // Application
        modelBuilder.Entity<Application>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.CoverLetter).HasColumnType("text");
            e.Property(a => a.ResumeUrl).HasMaxLength(500);
            e.Property(a => a.Status).HasConversion<string>().IsRequired().HasMaxLength(20);
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

        // SavedJob
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

        // Resume (simplified JSON storage)
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
    }
}
