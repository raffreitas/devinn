using DevInn.Domain.Aggregates.Financial;
using DevInn.Domain.Shared.ValueObjects;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DevInn.Infrastructure.Persistence.Configurations;

internal sealed class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.ToTable("expenses");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedNever();
        builder.Property(e => e.CategoryId).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(500);
        builder.Property(e => e.Status).IsRequired().HasConversion<string>().HasMaxLength(20);

        var moneyConverter = new ValueConverter<Money, decimal>(m => m.Value, d => new Money(d));
        builder.Property(e => e.Amount).HasConversion(moneyConverter).HasPrecision(18, 2).IsRequired();

        var dateOnlyConverter = new ValueConverter<DateOnly?, DateTime?>(
            d => d.HasValue ? d.Value.ToDateTime(TimeOnly.MinValue) : null,
            dt => dt.HasValue ? DateOnly.FromDateTime(dt.Value) : null);

        builder.Property(e => e.DueDate).HasConversion(dateOnlyConverter).HasColumnType("date").IsRequired();
        builder.Property(e => e.PaymentDate).HasConversion(dateOnlyConverter).HasColumnType("date");
        builder.Property(e => e.PaymentMethod).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.UpdatedAt).IsRequired();

        builder.HasOne<ExpenseCategory>()
            .WithMany()
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}