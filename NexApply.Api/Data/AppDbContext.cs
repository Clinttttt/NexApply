using Microsoft.EntityFrameworkCore;
using NexApply.Api.Entities;

namespace NexApply.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<CompanyProfile> CompanyProfiles { get; set; }
        public DbSet<StudentProfile> StudentProfiles { get; set; }
        public DbSet<JobListing> JobListings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

      
            modelBuilder.Entity<User>(e =>
            {
                e.HasKey(u => u.Id);
                e.HasIndex(u => u.Email).IsUnique();
                e.Property(u => u.Email).IsRequired().HasMaxLength(256);
                e.Property(u=> u.Username).HasMaxLength(100);
                e.Property(u => u.Role).IsRequired().HasMaxLength(20);
            });

           
            modelBuilder.Entity<CompanyProfile>(e =>
            {
                e.HasKey(c => c.Id);
                e.Property(c => c.CompanyName).IsRequired().HasMaxLength(200);
                e.Property(c => c.Website).HasMaxLength(500);
                e.Property(c => c.LogoUrl).HasMaxLength(500);
                e.Property(c => c.Industry).HasMaxLength(100);
                e.Property(c => c.Location).HasMaxLength(200);

                e.HasOne(c => c.User)
                 .WithOne(u => u.CompanyProfile)
                 .HasForeignKey<CompanyProfile>(c => c.UserId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            
            modelBuilder.Entity<StudentProfile>(e =>
            {
                e.HasKey(s => s.Id);
                e.Property(s => s.FullName).IsRequired().HasMaxLength(200);
                e.Property(s => s.University).HasMaxLength(200);
                e.Property(s => s.Course).HasMaxLength(200);
                e.Property(s => s.ResumeFilePath).HasMaxLength(500);
                
                e.Property(s => s.ParsedResumeText).HasColumnType("text");

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
                e.Property(j => j.RequiredSkills).IsRequired().HasColumnType("text");
                e.Property(j => j.Location).IsRequired().HasMaxLength(200);

             
                e.Property(j => j.Status)
                 .HasConversion<string>()
                 .HasMaxLength(20);

                e.Property(j => j.JobType)
                 .HasConversion<string>()
                 .HasMaxLength(20);

                e.HasOne(j => j.Company)
                 .WithMany(c => c.JobListings)
                 .HasForeignKey(j => j.CompanyId)
                 .OnDelete(DeleteBehavior.Cascade);

              
                e.HasIndex(j => j.Status);
                e.HasIndex(j => j.CreatedAt);
            });

            
            modelBuilder.Entity<Application>(e =>
            {
                e.HasKey(a => a.Id);
                e.Property(a => a.CoverLetter).HasColumnType("text");
                e.Property(a => a.ResumeUrl).HasMaxLength(500);

                e.Property(a => a.Status)
                 .HasConversion<string>()
                 .HasMaxLength(20);

               
                e.HasIndex(a => new { a.StudentId, a.JobListingId }).IsUnique();

                e.HasOne(a => a.Student)
                 .WithMany(s => s.Applications)
                 .HasForeignKey(a => a.StudentId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(a => a.JobListing)
                 .WithMany(j => j.Applications)
                 .HasForeignKey(a => a.JobListingId)
                 .OnDelete(DeleteBehavior.Restrict);
            });
  
        }

    }
}
