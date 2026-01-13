using DevInn.Features.Inns;
using DevInn.Features.Inns.Domain;
using DevInn.Features.Inventories;
using DevInn.Features.Inventories.Domain;
using DevInn.Features.Users;
using DevInn.Features.Users.Domain;
using DevInn.Shared.Tenancy;

using Microsoft.EntityFrameworkCore;

namespace DevInn.Shared.Persistence.Context;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantContext tenantContext)
    : DbContext(options)
{
    public DbSet<Inn> Inns => Set<Inn>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<RoomCategory> RoomCategories => Set<RoomCategory>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(InnFeature).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(InventoryFeature).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(UsersFeature).Assembly);

        modelBuilder.Entity<RoomCategory>().HasQueryFilter(r => r.InnId == tenantContext.TenantId);
        modelBuilder.Entity<Room>().HasQueryFilter(r => r.InnId == tenantContext.TenantId);
        modelBuilder.Entity<User>().HasQueryFilter(u => u.InnId == tenantContext.TenantId);

        base.OnModelCreating(modelBuilder);
    }
}