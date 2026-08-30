using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexApply.Api.Domain;

namespace NexApply.Api.Data.Configurations;

public sealed class NotificationStateConfiguration : IEntityTypeConfiguration<NotificationState>
{
    public void Configure(EntityTypeBuilder<NotificationState> builder)
    {
        builder.HasKey(state => state.Id);
        builder.Property(state => state.NotificationId).IsRequired().HasMaxLength(300);
        builder.Property(state => state.CreatedAt).IsRequired();

        builder.HasIndex(state => new { state.StudentId, state.NotificationId }).IsUnique();
        builder.HasIndex(state => state.StudentId);
    }
}
