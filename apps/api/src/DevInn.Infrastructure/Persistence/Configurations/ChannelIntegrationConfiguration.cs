using System.Text.Json;

using DevInn.Domain.Aggregates.Integrations;
using DevInn.Domain.Aggregates.Integrations.ValueObjects;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DevInn.Infrastructure.Persistence.Configurations;

internal sealed class ChannelIntegrationConfiguration : IEntityTypeConfiguration<ChannelIntegration>
{
    public void Configure(EntityTypeBuilder<ChannelIntegration> builder)
    {
        builder.ToTable("channel_integrations");

        builder.HasKey(ci => ci.Id);
        builder.Property(ci => ci.Id).ValueGeneratedNever();
        builder.Property(ci => ci.InnId).IsRequired();
        builder.Property(ci => ci.RoomId).IsRequired();
        builder.Property(ci => ci.ChannelType).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(ci => ci.ICalUrl).IsRequired().HasColumnName("ical_url").HasMaxLength(500);
        builder.Property(ci => ci.IsActive).IsRequired();

        // Timestamps
        builder.Property(ci => ci.CreatedAt).IsRequired();
        builder.Property(ci => ci.UpdatedAt).IsRequired();

        // Store SyncStatus as JSON
        var syncStatusConverter = new ValueConverter<SyncStatus, string>(
            v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
            s => JsonSerializer.Deserialize<SyncStatus>(s, (JsonSerializerOptions?)null)
                 ?? SyncStatus.NeverSynced());

        builder.Property(ci => ci.SyncStatus)
            .HasColumnName("sync_status")
            .HasColumnType("jsonb")
            .HasConversion(syncStatusConverter)
            .IsRequired();

        // Indexes
        builder.HasIndex(ci => ci.RoomId);
        builder.HasIndex(ci => new { ci.InnId, ci.IsActive });
    }
}