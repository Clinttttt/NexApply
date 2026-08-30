using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexApply.Api.Domain;

namespace NexApply.Api.Data.Configurations;

public sealed class CompanyUserSettingsConfiguration : IEntityTypeConfiguration<CompanyUserSettings>
{
    public void Configure(EntityTypeBuilder<CompanyUserSettings> builder)
    {
        builder.HasKey(settings => settings.Id);
        builder.Property(settings => settings.UserId).IsRequired();
        builder.Property(settings => settings.ApplicantUpdatesEnabled).IsRequired().HasDefaultValue(true);
        builder.Property(settings => settings.WeeklyDigestEnabled).IsRequired().HasDefaultValue(false);
        builder.Property(settings => settings.CreatedAt).IsRequired();

        builder.HasIndex(settings => settings.UserId).IsUnique();

        builder.HasOne(settings => settings.User)
            .WithOne()
            .HasForeignKey<CompanyUserSettings>(settings => settings.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
