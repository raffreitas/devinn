# Timezone Handling Patterns for DevInn

This reference provides specific patterns for handling timezones in the DevInn project.

## Core Rules

1. **Database**: Always store timestamps in UTC
2. **Domain**: Use `DateTimeOffset` to preserve timezone context
3. **Validation**: Always compare in UTC
4. **Queries**: Convert parameters to UTC before database queries

## Database Configuration

PostgreSQL stores `timestamp with time zone` in UTC automatically.

Entity Framework Core configuration:

```csharp
protected override void ConfigureConventions(ModelConfigurationBuilder config)
{
    config.Properties<DateTimeOffset>()
        .HaveConversion<DateTimeOffsetToUtcConverter>();
}
```

Value converter implementation:

```csharp
internal sealed class DateTimeOffsetToUtcConverter 
    : ValueConverter<DateTimeOffset, DateTimeOffset>
{
    public DateTimeOffsetToUtcConverter()
        : base(
            v => v.ToUniversalTime(),  // Write: convert to UTC
            v => v.ToUniversalTime())  // Read: already UTC
    {
    }
}
```

## Domain Patterns

### Value Objects with DateTimeOffset

```csharp
public readonly record struct StayPeriod
{
    public DateTimeOffset CheckIn { get; private init; }
    public DateTimeOffset CheckOut { get; private init; }
    
    public StayPeriod(DateTimeOffset checkIn, DateTimeOffset checkOut)
    {
        // Validation in UTC for consistency
        if (checkIn.ToUniversalTime() >= checkOut.ToUniversalTime())
            throw new ArgumentException("Check-in must be before check-out");
            
        CheckIn = checkIn;  // Preserves original offset
        CheckOut = checkOut;
    }
    
    public int Nights => 
        (CheckOut.ToUniversalTime().Date - CheckIn.ToUniversalTime().Date).Days;
}
```

## Application Layer Patterns

### Command Validation

Always validate dates in UTC:

```csharp
public sealed class CreateBookingValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingValidator()
    {
        RuleFor(x => x.CheckIn)
            .GreaterThanOrEqualTo(DateTimeOffset.UtcNow.Date)
            .WithMessage("Check-in date cannot be in the past");
            
        RuleFor(x => x.CheckIn)
            .LessThan(x => x.CheckOut)
            .WithMessage("Check-in must be before check-out");
    }
}
```

### Repository Queries

Convert parameters to UTC before querying:

```csharp
public async Task<bool> HasOverlappingBookingsAsync(
    Guid roomId,
    DateTimeOffset checkIn,
    DateTimeOffset checkOut,
    CancellationToken ct = default)
{
    var checkInUtc = checkIn.ToUniversalTime();
    var checkOutUtc = checkOut.ToUniversalTime();
    
    return await _context.Bookings
        .AnyAsync(b =>
            b.RoomId == roomId &&
            b.StayPeriod.CheckIn < checkOutUtc &&
            b.StayPeriod.CheckOut > checkInUtc,
            ct);
}
```

### Date Range Queries

```csharp
public async Task<List<Booking>> GetBookingsByDateRangeAsync(
    DateTimeOffset startDate,
    DateTimeOffset endDate,
    CancellationToken ct = default)
{
    var startUtc = startDate.ToUniversalTime();
    var endUtc = endDate.ToUniversalTime();
    
    return await _context.Bookings
        .Where(b => 
            b.StayPeriod.CheckIn >= startUtc &&
            b.StayPeriod.CheckIn < endUtc)
        .ToListAsync(ct);
}
```

## API Response Patterns

### Option 1: Return UTC (Recommended for SPAs)

```csharp
public sealed record BookingResponse
{
    public Guid Id { get; init; }
    public DateTimeOffset CheckIn { get; init; }  // UTC
    public DateTimeOffset CheckOut { get; init; }  // UTC
}
```

Client handles timezone conversion in the browser.

### Option 2: Convert to Hotel Timezone

```csharp
private static BookingResponse ToResponse(
    Booking booking, 
    string hotelTimeZoneId)
{
    var tz = TimeZoneInfo.FindSystemTimeZoneById(hotelTimeZoneId);
    
    return new BookingResponse
    {
        Id = booking.Id,
        CheckIn = TimeZoneInfo.ConvertTime(booking.StayPeriod.CheckIn, tz),
        CheckOut = TimeZoneInfo.ConvertTime(booking.StayPeriod.CheckOut, tz)
    };
}
```

## Hotel Timezone Configuration

Each hotel has an IANA timezone identifier:

```csharp
public sealed class Inn : Entity
{
    public string TimeZoneId { get; private set; } = "America/Sao_Paulo";
    
    // Examples:
    // "America/Sao_Paulo"  - Brasília (UTC-3)
    // "America/New_York"   - New York (UTC-5/-4)
    // "Europe/London"      - London (UTC+0/+1)
    // "Asia/Tokyo"         - Tokyo (UTC+9)
}
```

Usage in queries:

```csharp
var inn = await _context.Inns.FindAsync(innId);
var tz = TimeZoneInfo.FindSystemTimeZoneById(inn.TimeZoneId);
var localTime = TimeZoneInfo.ConvertTime(utcTime, tz);
```

## Common Pitfalls

### ❌ DON'T: Use DateTime.Now

```csharp
// WRONG - depends on server timezone
RuleFor(x => x.CheckIn)
    .GreaterThanOrEqualTo(DateTime.Now);
```

### ✅ DO: Use DateTimeOffset.UtcNow

```csharp
// CORRECT - always UTC
RuleFor(x => x.CheckIn)
    .GreaterThanOrEqualTo(DateTimeOffset.UtcNow);
```

### ❌ DON'T: Query with non-UTC offset

```csharp
// WRONG - Npgsql rejects offsets != 0
var checkIn = DateTimeOffset.Parse("2026-01-20T14:00:00-03:00");
var result = await _context.Bookings
    .Where(b => b.StayPeriod.CheckIn == checkIn)  // ERROR
    .ToListAsync();
```

### ✅ DO: Convert to UTC first

```csharp
// CORRECT - convert before querying
var checkInUtc = checkIn.ToUniversalTime();
var result = await _context.Bookings
    .Where(b => b.StayPeriod.CheckIn == checkInUtc)
    .ToListAsync();
```

### ❌ DON'T: Compare DateTimeOffset directly in different timezones

```csharp
// WRONG - may give unexpected results
if (booking.CheckIn > request.CheckIn)
{
    // This works but can be confusing
}
```

### ✅ DO: Explicitly convert for clarity

```csharp
// CORRECT - explicit conversion makes intent clear
if (booking.CheckIn.ToUniversalTime() > request.CheckIn.ToUniversalTime())
{
    // Clear and explicit
}
```

## Migration Example

When adding timestamp columns:

```csharp
migrationBuilder.AddColumn<DateTimeOffset>(
    name: "CheckIn",
    table: "Bookings",
    type: "timestamp with time zone",  // PostgreSQL
    nullable: false);
```

## Testing Patterns

### Unit Tests

```csharp
[Fact]
public void StayPeriod_Should_Calculate_Nights_Correctly_Across_Timezones()
{
    // Arrange
    var checkIn = new DateTimeOffset(2026, 1, 20, 14, 0, 0, 
        TimeSpan.FromHours(-3));  // Brasília
    var checkOut = new DateTimeOffset(2026, 1, 22, 12, 0, 0, 
        TimeSpan.FromHours(-3));  // Brasília
    
    // Act
    var period = new StayPeriod(checkIn, checkOut);
    
    // Assert
    period.Nights.Should().Be(2);
}
```

### Integration Tests

```csharp
[Fact]
public async Task Should_Find_Bookings_In_UTC()
{
    // Arrange
    var checkIn = new DateTimeOffset(2026, 1, 20, 14, 0, 0, 
        TimeSpan.FromHours(-3));
    await AddBookingAsync(roomId, checkIn, checkIn.AddDays(2));
    
    // Act - query with UTC time
    var checkInUtc = checkIn.ToUniversalTime();
    var result = await Repository.FindByDateAsync(checkInUtc);
    
    // Assert
    result.Should().NotBeEmpty();
}
```

## Summary Table

| Layer | Type | Offset | When to Convert |
|-------|------|--------|-----------------|
| Client | DateTimeOffset | Local (-03:00) | When sending to API |
| API/Domain | DateTimeOffset | Preserved | N/A (ValueConverter handles) |
| PostgreSQL | timestamp with time zone | UTC (+00:00) | Automatic (ValueConverter) |
| Queries | DateTimeOffset | UTC (+00:00) | Before WHERE/comparisons |
| Validations | DateTimeOffset | UTC (+00:00) | When comparing with "now" |
| Response | DateTimeOffset | UTC or Local | Business decision |

## References

- Full documentation: `apps/api/docs/TIMEZONE_BEST_PRACTICES.md`
- [PostgreSQL Timestamp Docs](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [.NET DateTimeOffset Guide](https://learn.microsoft.com/en-us/dotnet/standard/datetime/choosing-between-datetime)
- [IANA Time Zone Database](https://www.iana.org/time-zones)
