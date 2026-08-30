using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexApply.Api.Domain;

namespace NexApply.Api.Data.Configurations;

public sealed class ResumeConfiguration : IEntityTypeConfiguration<Resume>
{
    public void Configure(EntityTypeBuilder<Resume> builder)
    {
        builder.HasKey(resume => resume.Id);
        builder.Property(resume => resume.Headline).HasMaxLength(200);
        builder.Property(resume => resume.AboutMe).HasColumnType("text");
        builder.Property(resume => resume.EducationJson).HasColumnType("text").IsRequired();
        builder.Property(resume => resume.WorkExperienceJson).HasColumnType("text").IsRequired();
        builder.Property(resume => resume.SkillsJson).HasColumnType("text").IsRequired();
        builder.Property(resume => resume.CreatedAt).IsRequired();

        builder.HasOne(resume => resume.StudentProfile)
            .WithOne(profile => profile.Resume)
            .HasForeignKey<Resume>(resume => resume.StudentProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(resume => resume.StudentProfileId).IsUnique();
    }
}
