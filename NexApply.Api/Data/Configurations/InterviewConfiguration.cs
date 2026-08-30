using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexApply.Api.Domain;

namespace NexApply.Api.Data.Configurations;

public sealed class InterviewConfiguration : IEntityTypeConfiguration<Interview>
{
    public void Configure(EntityTypeBuilder<Interview> builder)
    {
        builder.HasKey(interview => interview.Id);
        builder.Property(interview => interview.ScheduledAt).IsRequired();
        builder.Property(interview => interview.DurationMinutes).IsRequired();
        builder.Property(interview => interview.Format).IsRequired();
        builder.Property(interview => interview.Status).IsRequired();
        builder.Property(interview => interview.Location).HasMaxLength(500);
        builder.Property(interview => interview.MeetingLink).HasMaxLength(1000);
        builder.Property(interview => interview.Notes).HasColumnType("text");
        builder.Property(interview => interview.Feedback).HasColumnType("text");
        builder.Property(interview => interview.Recommendation).HasMaxLength(100);
        builder.Property(interview => interview.CreatedAt).IsRequired();

        builder.HasOne(interview => interview.Application)
            .WithMany()
            .HasForeignKey(interview => interview.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(interview => interview.ScheduledAt);
        builder.HasIndex(interview => interview.Status);
    }
}
