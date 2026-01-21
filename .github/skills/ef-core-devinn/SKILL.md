---
name: ef-core-devinn
description: Expert in Entity Framework Core for the DevInn project. Use this skill when working with EF Core configurations, migrations, repositories, or database operations in the DevInn .NET backend. Handles entity configurations, value converters, owned entities, complex types, and PostgreSQL-specific features.
---

# Entity Framework Core - DevInn Project

Expert skill for working with Entity Framework Core in the DevInn booking management system.

## Project Configuration

The DevInn project uses:
- **Entity Framework Core** with PostgreSQL
- **ApplicationDbContext** in `Infrastructure/Persistence/Context/`
- **Configurations** in `Infrastructure/Persistence/Configurations/`
- **Migrations** in `Infrastructure/Persistence/Migrations/`
- **Repositories** in `Infrastructure/Persistence/Repositories/`

## Entity Configuration Patterns

### Basic Configuration Template

```csharp
internal sealed class EntityConfiguration : IEntityTypeConfiguration<Entity>
{
    public void Configure(EntityTypeBuilder<Entity> builder)
    {
        builder.ToTable("table_name");
        
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedNever(); // GUID from domain
        
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.UpdatedAt).IsRequired();
    }
}
```

**Key patterns:**
- Use `internal sealed` for configuration classes
- Snake_case table names
- GUID primary keys with `ValueGeneratedNever()`
- Configure required properties, max lengths, and column types explicitly

### Enum Conversions

Convert enums to strings for database storage:

```csharp
builder.Property(b => b.Status)
    .IsRequired()
    .HasConversion<string>()
    .HasMaxLength(20);
```

### Value Object Conversions

#### Simple Value Objects (Money)

```csharp
var moneyConverter = new ValueConverter<Money, decimal>(
    m => m.Value,           // To database
    d => new Money(d)       // From database
);

builder.Property(b => b.TotalValue)
    .HasConversion(moneyConverter)
    .HasPrecision(18, 2)
    .IsRequired();
```

#### DateOnly Conversions

```csharp
var dateOnlyConverter = new ValueConverter<DateOnly?, DateTime?>(
    d => d.HasValue ? d.Value.ToDateTime(TimeOnly.MinValue) : null,
    dt => dt.HasValue ? DateOnly.FromDateTime(dt.Value) : null
);

builder.Property(e => e.BirthDate)
    .HasConversion(dateOnlyConverter)
    .HasColumnType("date");
```

### Complex Properties (Value Objects with Multiple Fields)

Use `ComplexProperty` for value objects stored in the same table:

```csharp
builder.ComplexProperty(b => b.StayPeriod, spb =>
{
    spb.Property(s => s.CheckIn)
        .HasColumnName("check_in")
        .HasColumnType("timestamp with time zone")
        .IsRequired();
        
    spb.Property(s => s.CheckOut)
        .HasColumnName("check_out")
        .HasColumnType("timestamp with time zone")
        .IsRequired();
});
```

### Owned Entities

Use `OwnsOne` for value objects with complex mapping:

```csharp
builder.OwnsOne(b => b.Guest, gb =>
{
    gb.Property(g => g.Name)
        .HasColumnName("guest_name")
        .IsRequired()
        .HasMaxLength(200);
        
    gb.Property(g => g.Phone)
        .HasColumnName("guest_phone")
        .IsRequired()
        .HasMaxLength(20);
        
    gb.Property(g => g.Email)
        .HasColumnName("guest_email")
        .HasMaxLength(200);
});
```

### JSON Columns (PostgreSQL)

For collections stored as JSONB:

```csharp
var childrenConverter = new ValueConverter<IReadOnlyCollection<int>, string>(
    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
    s => JsonSerializer.Deserialize<List<int>>(s) ?? new List<int>()
);

var childrenComparer = new ValueComparer<IReadOnlyCollection<int>>(
    (c1, c2) => (c1 ?? Array.Empty<int>()).SequenceEqual(c2 ?? Array.Empty<int>()),
    c => c.Aggregate(17, (h, i) => h * 23 + i.GetHashCode()),
    c => c.ToList()
);

builder.OwnsOne(b => b.Occupancy, ob =>
{
    var childrenProp = ob.Property(o => o.ChildrenAges)
        .HasColumnName("children_ages")
        .HasConversion(childrenConverter)
        .HasColumnType("jsonb");
        
    childrenProp.Metadata.SetValueComparer(childrenComparer);
});
```

**IMPORTANT:** When using custom converters for collections, always set a ValueComparer so EF Core can detect changes.

### Relationships

#### One-to-Many with Restrict

```csharp
builder.HasOne<Room>()
    .WithMany()
    .HasForeignKey(b => b.RoomId)
    .OnDelete(DeleteBehavior.Restrict);
```

#### One-to-Many with Cascade

```csharp
builder.HasMany(b => b.Payments)
    .WithOne()
    .HasForeignKey(p => p.BookingId)
    .OnDelete(DeleteBehavior.Cascade);
```

### Ignored Properties (Calculated)

Ignore properties calculated from other data:

```csharp
builder.Ignore(b => b.PaidValue); // Calculated from Payments collection
```

### Indexes

Create indexes in migrations using raw SQL for better control:

```csharp
// In configuration - add comment
// Indexes are created at DB migration level using raw SQL 
// to allow INCLUDE and precise control.

// In migration - use raw SQL
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.Sql(@"
        CREATE INDEX ix_bookings_room_dates 
        ON bookings (room_id, check_in, check_out)
        INCLUDE (status);
    ");
}
```

**Reason:** EF Core has limitations translating complex property expressions in indexes. Raw SQL provides full control.

## Application DbContext

### Context Structure

```csharp
public sealed class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<RoomCategory> RoomCategories => Set<RoomCategory>();
    public DbSet<Inn> Inns => Set<Inn>();
    
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(ApplicationDbContext).Assembly
        );
    }
    
    protected override void ConfigureConventions(
        ModelConfigurationBuilder configurationBuilder)
    {
        // Global DateTimeOffset to UTC conversion
        configurationBuilder.Properties<DateTimeOffset>()
            .HaveConversion<DateTimeOffsetToUtcConverter>();
    }
}
```

### Global Conventions

Apply conventions to all entities:

```csharp
protected override void ConfigureConventions(
    ModelConfigurationBuilder configurationBuilder)
{
    // Convert all DateTimeOffset to UTC
    configurationBuilder.Properties<DateTimeOffset>()
        .HaveConversion<DateTimeOffsetToUtcConverter>();
        
    // Convert all enums to strings
    configurationBuilder.Properties<Enum>()
        .HaveConversion<string>();
}
```

### UTC Converter

```csharp
internal sealed class DateTimeOffsetToUtcConverter 
    : ValueConverter<DateTimeOffset, DateTimeOffset>
{
    public DateTimeOffsetToUtcConverter()
        : base(
            v => v.ToUniversalTime(),  // Write: to UTC
            v => v.ToUniversalTime())  // Read: already UTC
    {
    }
}
```

## Migrations

### Creating Migrations

From the Infrastructure project directory:

```bash
# Create new migration
dotnet ef migrations add MigrationName --startup-project ../DevInn.WebApi

# Apply migrations
dotnet ef database update --startup-project ../DevInn.WebApi

# Generate SQL script
dotnet ef migrations script --startup-project ../DevInn.WebApi -o migration.sql

# Remove last migration (if not applied)
dotnet ef migrations remove --startup-project ../DevInn.WebApi
```

### Migration Best Practices

1. **Use descriptive names**: `AddBookingStatusIndex` not `Update1`
2. **Review generated code**: Always check the migration before applying
3. **Add data migrations separately**: Use `migrationBuilder.Sql()` for data changes
4. **Test rollback**: Ensure `Down()` method works correctly

### Manual Index Creation in Migrations

```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.CreateTable(
        name: "bookings",
        // ... columns ...
    );
    
    // Create indexes with raw SQL for better control
    migrationBuilder.Sql(@"
        CREATE INDEX ix_bookings_room_dates 
        ON bookings (room_id, check_in, check_out)
        INCLUDE (status)
        WHERE status IN ('Confirmed', 'CheckedIn');
    ");
}

protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.Sql("DROP INDEX IF EXISTS ix_bookings_room_dates;");
    migrationBuilder.DropTable(name: "bookings");
}
```

## Repository Pattern

### Repository Interface

```csharp
public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<Booking>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(Booking booking, CancellationToken ct = default);
    void Update(Booking booking);
    void Remove(Booking booking);
}
```

### Repository Implementation

```csharp
internal sealed class BookingRepository : IBookingRepository
{
    private readonly ApplicationDbContext _context;
    
    public BookingRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<Booking?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Bookings
            .Include(b => b.Payments)
            .FirstOrDefaultAsync(b => b.Id == id, ct);
    }
    
    public async Task<List<Booking>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.Bookings
            .AsNoTracking()
            .Include(b => b.Payments)
            .ToListAsync(ct);
    }
    
    public async Task AddAsync(Booking booking, CancellationToken ct = default)
    {
        await _context.Bookings.AddAsync(booking, ct);
    }
    
    public void Update(Booking booking)
    {
        _context.Bookings.Update(booking);
    }
    
    public void Remove(Booking booking)
    {
        _context.Bookings.Remove(booking);
    }
}
```

**Key patterns:**
- Use `AsNoTracking()` for read-only queries
- Use `Include()` to load related entities
- Repository doesn't call `SaveChanges()` - leave that to Unit of Work pattern
- Use `async` for database operations

## Query Patterns

### Basic Query

```csharp
var rooms = await _context.Rooms
    .AsNoTracking()
    .Where(r => r.CategoryId == categoryId)
    .OrderBy(r => r.Number)
    .ToListAsync(ct);
```

### Query with Projection

```csharp
var dtos = await _context.Rooms
    .AsNoTracking()
    .Select(r => new RoomDto
    {
        Id = r.Id,
        Number = r.Number,
        CategoryName = r.Category.Name
    })
    .ToListAsync(ct);
```

### Complex Query with Multiple Conditions

```csharp
var bookings = await _context.Bookings
    .AsNoTracking()
    .Include(b => b.Payments)
    .Where(b => 
        b.RoomId == roomId &&
        b.Status == BookingStatus.Confirmed &&
        b.StayPeriod.CheckIn >= startDate &&
        b.StayPeriod.CheckOut <= endDate)
    .OrderBy(b => b.StayPeriod.CheckIn)
    .ToListAsync(ct);
```

### Pagination

```csharp
var pagedBookings = await _context.Bookings
    .AsNoTracking()
    .OrderBy(b => b.CreatedAt)
    .Skip((pageNumber - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync(ct);
```

## PostgreSQL-Specific Features

### Timestamp with Time Zone

Always use `timestamp with time zone` for DateTimeOffset:

```csharp
builder.Property(b => b.CreatedAt)
    .HasColumnType("timestamp with time zone")
    .IsRequired();
```

### JSONB Columns

For complex JSON data:

```csharp
builder.Property(b => b.Metadata)
    .HasColumnType("jsonb");
```

### Array Types

For PostgreSQL arrays:

```csharp
builder.Property(b => b.Tags)
    .HasColumnType("text[]");
```

## Transaction Management

### Explicit Transactions

```csharp
using var transaction = await _context.Database.BeginTransactionAsync(ct);
try
{
    // Perform operations
    await _context.SaveChangesAsync(ct);
    
    // Commit
    await transaction.CommitAsync(ct);
}
catch
{
    await transaction.RollbackAsync(ct);
    throw;
}
```

### Implicit Transactions

`SaveChangesAsync()` is automatically wrapped in a transaction.

## Common Issues & Solutions

### Issue: Owned entity not updating

**Solution:** Ensure the navigation property is set and the owned entity is fully replaced:

```csharp
booking.Guest = new Guest(name, phone, email);
_context.Update(booking);
```

### Issue: Collection not tracked

**Solution:** Use `ValueComparer` for complex collections stored as JSON.

### Issue: DateTimeOffset timezone issues

**Solution:** Always convert to UTC before queries. The global converter handles persistence.

## Testing with EF Core

### In-Memory Database (Unit Tests)

```csharp
var options = new DbContextOptionsBuilder<ApplicationDbContext>()
    .UseInMemoryDatabase(databaseName: "TestDb")
    .Options;
    
var context = new ApplicationDbContext(options);
```

### PostgreSQL Test Container (Integration Tests)

```csharp
var connectionString = "Host=localhost;Database=testdb;...";
var options = new DbContextOptionsBuilder<ApplicationDbContext>()
    .UseNpgsql(connectionString)
    .Options;
```

## References

- EF Core Documentation: https://docs.microsoft.com/ef/core/
- Npgsql Documentation: https://www.npgsql.org/efcore/
- For timezone handling: See `../dotnet-clean-arch/references/timezone-patterns.md`
