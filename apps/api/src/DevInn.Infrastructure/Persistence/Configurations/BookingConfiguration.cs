using System.Text.Json;

using DevInn.Domain.Aggregates.Bookings;
using DevInn.Domain.Aggregates.Inns;
using DevInn.Domain.Aggregates.Inventory;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DevInn.Infrastructure.Persistence.Configurations;

internal sealed class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("bookings");

        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id).ValueGeneratedNever();
        builder.Property(b => b.InnId).IsRequired();
        builder.Property(b => b.RoomId).IsRequired();
        builder.Property(b => b.Notes).HasMaxLength(1000);
        builder.Property(b => b.Status).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(b => b.Source).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(b => b.TotalValue).HasPrecision(18, 2).IsRequired();
        builder.Property(b => b.ExternalId).HasMaxLength(255);
        builder.Property(b => b.ChannelIntegrationId);
        builder.Ignore(b => b.PaidValue); // Calculated from Payments collection
        // Timestamps
        builder.Property(b => b.CreatedAt).IsRequired();
        builder.Property(b => b.UpdatedAt).IsRequired();

        // Indexes
        builder.HasIndex(b => b.ExternalId).IsUnique();
        builder.HasIndex(b => b.ChannelIntegrationId);
        builder.HasIndex(b => b.Source);
        // Owned: StayPeriod (complex/owned type)
        builder.ComplexProperty(b => b.StayPeriod, spb =>
        {
            spb.Property(s => s.CheckIn).HasColumnName("check_in").HasColumnType("timestamp with time zone")
                .IsRequired();
            spb.Property(s => s.CheckOut).HasColumnName("check_out").HasColumnType("timestamp with time zone")
                .IsRequired();
        });

        // Owned: Guest (nullable for blocks)
        builder.OwnsOne(b => b.Guest, gb =>
        {
            gb.Property(g => g.Name).HasColumnName("guest_name").HasMaxLength(200);
            gb.Property(g => g.Phone).HasColumnName("guest_phone").HasMaxLength(20);
            gb.Property(g => g.Email).HasColumnName("guest_email").HasMaxLength(200);
            gb.Property(g => g.Document).HasColumnName("guest_document").HasMaxLength(50);
            gb.Property(g => g.BirthDate).HasColumnName("guest_birth_date").HasColumnType("date");
        });

        // Owned: Occupancy
        var childrenConverter = new ValueConverter<IReadOnlyCollection<int>, string>(
            v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
            s => JsonSerializer.Deserialize<List<int>>(s) ?? new List<int>());

        // ValueComparer to ensure EF core can detect changes in the collection
        var childrenComparer = new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<IReadOnlyCollection<int>>(
            (c1, c2) => (c1 ?? Array.Empty<int>()).SequenceEqual(c2 ?? Array.Empty<int>()),
            c => (c).Aggregate(17, (h, i) => h * 23 + i.GetHashCode()),
            c => c.ToList());

        builder.OwnsOne(b => b.Occupancy, ob =>
        {
            ob.Property(o => o.Adults).HasColumnName("adults");
            ob.Property(o => o.Children).HasColumnName("children");
            var childrenProp = ob.Property(o => o.ChildrenAges).HasColumnName("children_ages")
                .HasConversion(childrenConverter)
                .HasColumnType("jsonb");
            childrenProp.Metadata.SetValueComparer(childrenComparer);
        });

        // Foreign key to Room
        builder.HasOne<Room>().WithMany().HasForeignKey(b => b.RoomId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Inn>().WithMany().HasForeignKey(b => b.InnId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(b => b.Payments).WithOne().HasForeignKey(b => b.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property<byte[]>("RowVersion")
            .IsRowVersion()
            .HasColumnName("row_version");
    }
}