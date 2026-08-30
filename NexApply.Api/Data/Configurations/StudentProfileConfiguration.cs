using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexApply.Api.Domain;

namespace NexApply.Api.Data.Configurations;

public sealed class StudentProfileConfiguration : IEntityTypeConfiguration<StudentProfile>
{
    public void Configure(EntityTypeBuilder<StudentProfile> builder)
    {
        builder.HasKey(profile => profile.Id);
        builder.Property(profile => profile.FullName).IsRequired().HasMaxLength(200);
        builder.Property(profile => profile.Phone).HasMaxLength(50);
        builder.Property(profile => profile.Location).HasMaxLength(200);
        builder.Property(profile => profile.University).HasMaxLength(200);
        builder.Property(profile => profile.Course).HasMaxLength(200);
        builder.Property(profile => profile.LinkedIn).HasMaxLength(500);
        builder.Property(profile => profile.GitHub).HasMaxLength(500);
        builder.Property(profile => profile.Portfolio).HasMaxLength(500);
        builder.Property(profile => profile.ResumeFilePath).HasMaxLength(500);
        builder.Property(profile => profile.ParsedResumeText).HasColumnType("text");
        builder.Property(profile => profile.Feedback).HasColumnType("text");
        builder.Property(profile => profile.CreatedAt).IsRequired();

        builder.HasOne(profile => profile.User)
            .WithOne(user => user.StudentProfile)
            .HasForeignKey<StudentProfile>(profile => profile.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
