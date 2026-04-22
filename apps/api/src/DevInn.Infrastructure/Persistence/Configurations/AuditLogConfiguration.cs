using DevInn.Infrastructure.Persistence.Auditing;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevInn.Infrastructure.Persistence.Configurations;

internal sealed class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();
        builder.Property(x => x.InnId).IsRequired();
        builder.Property(x => x.Module).HasMaxLength(50).IsRequired();
        builder.Property(x => x.EntityName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.EntityId).IsRequired();
        builder.Property(x => x.Action).HasMaxLength(50).IsRequired();
        builder.Property(x => x.ActorId);
        builder.Property(x => x.Summary).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Changes).HasColumnType("jsonb");
        builder.Property(x => x.OccurredAt).IsRequired();

        builder.HasIndex(x => new { x.InnId, x.EntityName, x.EntityId, x.OccurredAt });
        builder.HasIndex(x => new { x.InnId, x.Module, x.OccurredAt });
    }
}
