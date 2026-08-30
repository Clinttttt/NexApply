using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexApply.Api.Domain;

namespace NexApply.Api.Data.Configurations;

public sealed class SavedJobConfiguration : IEntityTypeConfiguration<SavedJob>
{
    public void Configure(EntityTypeBuilder<SavedJob> builder)
    {
        builder.HasKey(savedJob => savedJob.Id);
        builder.Property(savedJob => savedJob.CreatedAt).IsRequired();

        builder.HasIndex(savedJob => new { savedJob.StudentId, savedJob.JobListingId }).IsUnique();

        builder.HasOne(savedJob => savedJob.Student)
            .WithMany(student => student.SavedJobs)
            .HasForeignKey(savedJob => savedJob.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(savedJob => savedJob.JobListing)
            .WithMany(listing => listing.SavedByStudents)
            .HasForeignKey(savedJob => savedJob.JobListingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
