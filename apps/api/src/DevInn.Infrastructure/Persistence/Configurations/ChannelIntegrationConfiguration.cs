using System.Text.Json;
using System.Text.Json.Serialization;

using DevInn.Domain.Aggregates.Integrations;
using DevInn.Domain.Aggregates.Integrations.ValueObjects;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DevInn.Infrastructure.Persistence.Configurations;

internal sealed class ChannelIntegrationConfiguration : IEntityTypeConfiguration<ChannelIntegration>
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() }
    };

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
            v => JsonSerializer.Serialize(v, JsonOptions),
            s => JsonSerializer.Deserialize<SyncStatus>(s, JsonOptions) ?? SyncStatus.NeverSynced()
        );

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