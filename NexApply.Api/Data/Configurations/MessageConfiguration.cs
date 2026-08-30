using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexApply.Api.Domain;

namespace NexApply.Api.Data.Configurations;

public sealed class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.HasKey(message => message.Id);
        builder.Property(message => message.Content).IsRequired().HasColumnType("text");
        builder.Property(message => message.Type).IsRequired().HasMaxLength(50);
        builder.Property(message => message.CreatedAt).IsRequired();

        builder.HasOne(message => message.Sender)
            .WithMany()
            .HasForeignKey(message => message.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(message => message.Receiver)
            .WithMany()
            .HasForeignKey(message => message.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(message => message.Interview)
            .WithMany()
            .HasForeignKey(message => message.InterviewId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(message => new { message.SenderId, message.ReceiverId });
        builder.HasIndex(message => message.CreatedAt);
    }
}
