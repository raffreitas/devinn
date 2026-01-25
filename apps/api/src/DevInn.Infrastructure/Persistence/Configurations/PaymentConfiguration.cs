using DevInn.Domain.Aggregates.Bookings.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevInn.Infrastructure.Persistence.Configurations;

internal sealed class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();
        builder.Property(x => x.BookingId).IsRequired();
        builder.Property(x => x.InnId).IsRequired();
        builder.Property(x => x.Amount).HasPrecision(18, 2).IsRequired();
        builder.Property(x => x.Method).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.PaymentDate).IsRequired().HasColumnType("timestamp with time zone");
        builder.Property(x => x.Notes).HasMaxLength(500);
        // Timestamps
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();

        builder.HasIndex(x => x.InnId);
    }
}