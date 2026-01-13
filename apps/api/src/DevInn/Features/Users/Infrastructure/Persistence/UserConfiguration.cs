using DevInn.Features.Inns.Domain;
using DevInn.Features.Users.Domain;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevInn.Features.Users.Infrastructure.Persistence;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();
        builder.Property(u => u.InnId).IsRequired();
        builder.Property(u => u.Email).IsRequired().HasMaxLength(255);
        builder.Property(u => u.Role).IsRequired().HasConversion<string>().HasMaxLength(20);

        builder.HasOne<Inn>()
            .WithMany()
            .HasForeignKey(u => u.InnId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(u => u.InnId);
    }
}