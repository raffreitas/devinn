using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Domain.Aggregates.Bookings;
using DevInn.Domain.Aggregates.Bookings.Entities;
using DevInn.Domain.Aggregates.Inns;
using DevInn.Domain.Aggregates.Inventory;
using DevInn.Domain.Aggregates.Financial;
using DevInn.Infrastructure.Persistence.Configurations;
using DevInn.Infrastructure.Persistence.Converters;

using Microsoft.EntityFrameworkCore;

namespace DevInn.Infrastructure.Persistence.Context;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantContext tenantContext)
    : DbContext(options)
{
    public DbSet<Inn> Inns => Set<Inn>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<RoomCategory> RoomCategories => Set<RoomCategory>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new InnConfiguration());

        modelBuilder.ApplyConfiguration(new RoomCategoryConfiguration());
        modelBuilder.Entity<RoomCategory>().HasQueryFilter(r => r.InnId == tenantContext.Tenant.Id);

        modelBuilder.ApplyConfiguration(new RoomConfiguration());
        modelBuilder.Entity<Room>().HasQueryFilter(r => r.InnId == tenantContext.Tenant.Id);

        modelBuilder.ApplyConfiguration(new BookingConfiguration());
        modelBuilder.Entity<Booking>().HasQueryFilter(b => b.InnId == tenantContext.Tenant.Id);

        modelBuilder.ApplyConfiguration(new PaymentConfiguration());
        modelBuilder.Entity<Payment>().HasQueryFilter(p => p.InnId == tenantContext.Tenant.Id);

        modelBuilder.ApplyConfiguration(new ExpenseConfiguration());
        modelBuilder.Entity<Expense>().HasQueryFilter(e => e.InnId == tenantContext.Tenant.Id);

        modelBuilder.ApplyConfiguration(new ExpenseCategoryConfiguration());
        modelBuilder.Entity<ExpenseCategory>().HasQueryFilter(e => e.InnId == tenantContext.Tenant.Id);

        base.OnModelCreating(modelBuilder);
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        // PostgreSQL requires UTC for timestamp with time zone
        configurationBuilder.Properties<DateTimeOffset>()
            .HaveConversion<DateTimeOffsetToUtcConverter>();
    }
}