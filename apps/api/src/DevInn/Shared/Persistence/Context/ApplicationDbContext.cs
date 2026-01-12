using DevInn.Features.Inns.Domain;

using Microsoft.EntityFrameworkCore;

namespace DevInn.Shared.Persistence.Context;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Inn> Inns => Set<Inn>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(Inn).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}