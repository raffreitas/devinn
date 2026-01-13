using DevInn.Domain.Aggregates.Inns;
using DevInn.Domain.Aggregates.Inventory;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevInn.Infrastructure.Persistence.Configurations;

internal sealed class RoomCategoryConfiguration : IEntityTypeConfiguration<RoomCategory>
{
    public void Configure(EntityTypeBuilder<RoomCategory> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).ValueGeneratedNever();
        builder.Property(r => r.InnId).IsRequired();
        builder.Property(r => r.Name).IsRequired().HasMaxLength(100);
        builder.Property(r => r.Description).HasMaxLength(500);
        builder.Property(r => r.MaxCapacity).IsRequired();
        builder.Property(r => r.BasePrice).IsRequired().HasPrecision(18, 2);
        builder.Property(r => r.ExtraPersonPrice).IsRequired().HasPrecision(18, 2);

        builder.HasOne<Inn>()
            .WithMany()
            .HasForeignKey(r => r.InnId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(r => r.InnId);
    }
}