using Microsoft.EntityFrameworkCore;
using NexApply.Api.Domain;

namespace NexApply.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
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
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
