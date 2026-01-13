using DevInn.Domain.Aggregates.Inns;
using DevInn.Domain.Aggregates.Inventory;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevInn.Infrastructure.Persistence.Configurations;

internal sealed class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).ValueGeneratedNever();
        builder.Property(r => r.InnId).IsRequired();
        builder.Property(r => r.CategoryId).IsRequired();
        builder.Property(r => r.Number).IsRequired();
        builder.Property(r => r.Name).HasMaxLength(100);
        builder.Property(r => r.Status).IsRequired().HasConversion<string>().HasMaxLength(20);

        builder.HasOne<RoomCategory>()
            .WithOne()
            .HasForeignKey<Room>(r => r.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Inn>()
            .WithMany()
            .HasForeignKey(r => r.InnId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(r => r.InnId);
    }
}