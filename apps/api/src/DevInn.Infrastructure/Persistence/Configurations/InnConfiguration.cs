using DevInn.Domain.Aggregates.Inns;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevInn.Infrastructure.Persistence.Configurations;

internal sealed class InnConfiguration : IEntityTypeConfiguration<Inn>
{
    public void Configure(EntityTypeBuilder<Inn> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Address).IsRequired().HasMaxLength(300);
        builder.Property(x => x.City).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Country).IsRequired().HasMaxLength(100);
        builder.Property(x => x.State).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Phone).IsRequired().HasMaxLength(20);
        builder.Property(x => x.Email).IsRequired().HasMaxLength(200);
        builder.Property(x => x.ZipCode).IsRequired().HasMaxLength(20);
        builder.Property(x => x.TimeZoneId).IsRequired().HasMaxLength(50)
            .HasDefaultValue("America/Sao_Paulo");
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.UpdatedAt).IsRequired();
    }
}