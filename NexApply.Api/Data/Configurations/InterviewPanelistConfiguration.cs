using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexApply.Api.Domain;

namespace NexApply.Api.Data.Configurations;

public sealed class InterviewPanelistConfiguration : IEntityTypeConfiguration<InterviewPanelist>
{
    public void Configure(EntityTypeBuilder<InterviewPanelist> builder)
    {
        builder.HasKey(panelist => panelist.Id);
        builder.Property(panelist => panelist.Name).IsRequired().HasMaxLength(200);
        builder.Property(panelist => panelist.Title).HasMaxLength(200);
        builder.Property(panelist => panelist.Email).HasMaxLength(256);
        builder.Property(panelist => panelist.CreatedAt).IsRequired();

        builder.HasOne(panelist => panelist.Interview)
            .WithMany(interview => interview.Panelists)
            .HasForeignKey(panelist => panelist.InterviewId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
