using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexApply.Api.Domain;

namespace NexApply.Api.Data.Configurations;

public sealed class ApplicationConfiguration : IEntityTypeConfiguration<Application>
{
    public void Configure(EntityTypeBuilder<Application> builder)
    {
        builder.HasKey(application => application.Id);
        builder.Property(application => application.CoverLetter).HasColumnType("text");
        builder.Property(application => application.ResumeUrl).HasMaxLength(500);
        builder.Property(application => application.Status).IsRequired();
        builder.Property(application => application.RecruiterNotes).HasColumnType("text");
        builder.Property(application => application.CreatedAt).IsRequired();

        builder.HasIndex(application => new { application.StudentId, application.JobListingId }).IsUnique();
        builder.HasIndex(application => application.Status);

        builder.HasOne(application => application.Student)
            .WithMany(student => student.Applications)
            .HasForeignKey(application => application.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(application => application.JobListing)
            .WithMany(listing => listing.Applications)
            .HasForeignKey(application => application.JobListingId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
