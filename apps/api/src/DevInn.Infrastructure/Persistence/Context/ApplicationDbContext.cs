using DevInn.Application.Common.Tenancy.Abstractions;
using DevInn.Domain.Aggregates.Bookings;
using DevInn.Domain.Aggregates.Inns;
using DevInn.Domain.Aggregates.Inventory;
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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new InnConfiguration());
        modelBuilder.ApplyConfiguration(new RoomCategoryConfiguration());
        modelBuilder.ApplyConfiguration(new RoomConfiguration());
        modelBuilder.ApplyConfiguration(new BookingConfiguration());

        modelBuilder.Entity<RoomCategory>().HasQueryFilter(r => r.InnId == tenantContext.Tenant.Id);
        modelBuilder.Entity<Room>().HasQueryFilter(r => r.InnId == tenantContext.Tenant.Id);
        modelBuilder.Entity<Booking>().HasQueryFilter(b => b.InnId == tenantContext.Tenant.Id);

        base.OnModelCreating(modelBuilder);
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        // PostgreSQL requires UTC for timestamp with time zone
        configurationBuilder.Properties<DateTimeOffset>()
            .HaveConversion<DateTimeOffsetToUtcConverter>();
    }
}