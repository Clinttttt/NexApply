using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexApply.Api.Domain;

namespace NexApply.Api.Data.Configurations;

public sealed class CompanyProfileConfiguration : IEntityTypeConfiguration<CompanyProfile>
{
    public void Configure(EntityTypeBuilder<CompanyProfile> builder)
    {
        builder.HasKey(profile => profile.Id);
        builder.Property(profile => profile.CompanyName).IsRequired().HasMaxLength(200);
        builder.Property(profile => profile.Tagline).HasMaxLength(200);
        builder.Property(profile => profile.Description).HasColumnType("text");
        builder.Property(profile => profile.Mission).HasColumnType("text");
        builder.Property(profile => profile.Website).HasMaxLength(500);
        builder.Property(profile => profile.LogoUrl).HasColumnType("text");
        builder.Property(profile => profile.Industry).HasMaxLength(100);
        builder.Property(profile => profile.Location).HasMaxLength(200);
        builder.Property(profile => profile.CompanySize).HasMaxLength(50);
        builder.Property(profile => profile.Founded).HasMaxLength(50);
        builder.Property(profile => profile.PerksAndBenefits).HasColumnType("text");
        builder.Property(profile => profile.WorkCulture).HasMaxLength(500);
        builder.Property(profile => profile.ContactEmail).HasMaxLength(256);
        builder.Property(profile => profile.ContactPhone).HasMaxLength(50);
        builder.Property(profile => profile.LinkedInUrl).HasMaxLength(500);
        builder.Property(profile => profile.TwitterUrl).HasMaxLength(500);
        builder.Property(profile => profile.FacebookUrl).HasMaxLength(500);
        builder.Property(profile => profile.GitHubUrl).HasMaxLength(500);
        builder.Property(profile => profile.HiringManagerName).HasMaxLength(200);
        builder.Property(profile => profile.HiringManagerTitle).HasMaxLength(200);
        builder.Property(profile => profile.HiringManagerEmail).HasMaxLength(256);
        builder.Property(profile => profile.CreatedAt).IsRequired();

        builder.HasOne(profile => profile.User)
            .WithOne(user => user.CompanyProfile)
            .HasForeignKey<CompanyProfile>(profile => profile.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
