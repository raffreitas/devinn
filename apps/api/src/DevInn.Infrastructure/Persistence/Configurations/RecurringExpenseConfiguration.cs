using DevInn.Domain.Aggregates.Financial;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DevInn.Infrastructure.Persistence.Configurations;

internal sealed class RecurringExpenseConfiguration : IEntityTypeConfiguration<RecurringExpense>
{
    public void Configure(EntityTypeBuilder<RecurringExpense> builder)
    {
        builder.ToTable("recurring_expenses");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedNever();
        builder.Property(e => e.CategoryId).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(500).IsRequired();
        builder.Property(e => e.Amount).HasPrecision(18, 2).IsRequired();
        builder.Property(e => e.PaymentMethod).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.StartDate).HasColumnType("date").IsRequired();
        builder.Property(e => e.DayOfMonth).IsRequired();
        builder.Property(e => e.EndDate).HasColumnType("date");
        builder.Property(e => e.MaxOccurrences);
        builder.Property(e => e.LastGeneratedDueDate).HasColumnType("date");
        builder.Property(e => e.GeneratedOccurrencesCount).IsRequired();
        builder.Property(e => e.Status).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.UpdatedAt).IsRequired();

        builder.HasOne<ExpenseCategory>()
            .WithMany()
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}