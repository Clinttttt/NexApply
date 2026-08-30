using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexApply.Api.Domain;

namespace NexApply.Api.Data.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(user => user.Id);
        builder.HasIndex(user => user.Email).IsUnique();
        builder.Property(user => user.Email).IsRequired().HasMaxLength(256);
        builder.Property(user => user.Username).IsRequired().HasMaxLength(100);
        builder.Property(user => user.PasswordHash).IsRequired();
        builder.Property(user => user.Role).HasConversion<string>().IsRequired().HasMaxLength(20);
        builder.Property(user => user.RefreshToken).HasMaxLength(500);
        builder.Property(user => user.EmailVerificationCode).HasMaxLength(10);
        builder.Property(user => user.PasswordResetCode).HasMaxLength(10);
        builder.Property(user => user.CreatedAt).IsRequired();
    }
}
