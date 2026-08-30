using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexApply.Api.Domain;

namespace NexApply.Api.Data.Configurations;

public sealed class JobListingConfiguration : IEntityTypeConfiguration<JobListing>
{
    public void Configure(EntityTypeBuilder<JobListing> builder)
    {
        builder.HasKey(listing => listing.Id);
        builder.Property(listing => listing.Title).IsRequired().HasMaxLength(300);
        builder.Property(listing => listing.Description).IsRequired().HasColumnType("text");
        builder.Property(listing => listing.Responsibilities).IsRequired().HasColumnType("text");
        builder.Property(listing => listing.Qualifications).IsRequired().HasColumnType("text");
        builder.Property(listing => listing.RequiredSkills).IsRequired().HasColumnType("text");
        builder.Property(listing => listing.Benefits).HasColumnType("text");
        builder.Property(listing => listing.Location).IsRequired().HasMaxLength(200);
        builder.Property(listing => listing.JobType).IsRequired();
        builder.Property(listing => listing.WorkSetup).IsRequired();
        builder.Property(listing => listing.Status).IsRequired();
        builder.Property(listing => listing.SalaryMin).HasColumnType("decimal(18,2)");
        builder.Property(listing => listing.SalaryMax).HasColumnType("decimal(18,2)");
        builder.Property(listing => listing.ExperienceLevel).HasMaxLength(50);
        builder.Property(listing => listing.CreatedAt).IsRequired();

        builder.HasOne(listing => listing.Company)
            .WithMany()
            .HasForeignKey(listing => listing.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(listing => listing.CreatedAt);
        builder.HasIndex(listing => listing.Status);
    }
}
