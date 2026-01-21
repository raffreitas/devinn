---
name: devinn-backend
description: Specialized skill for the DevInn backend API project. Use this skill when working specifically with the DevInn .NET/C# booking management system located in apps/api. Includes project-specific commands, structure knowledge, domain entities (Bookings, Inventory, Inns, Financial), and development workflows.
---

# DevInn Backend Development

Specialized skill for developing the DevInn booking management system backend API.

## Project Overview

DevInn is a booking management system for inns and hotels built with:
- **.NET 9** with C#
- **PostgreSQL** database
- **Clean Architecture** with DDD
- **Minimal APIs**
- **MediatR** for CQRS
- **FluentValidation**
- **Entity Framework Core**

## Project Structure

```
apps/api/
├── src/
│   ├── DevInn.Domain/           # Core business logic
│   │   ├── Aggregates/
│   │   │   ├── Bookings/       # Booking aggregate
│   │   │   ├── Financial/      # Expenses, payments
│   │   │   ├── Inns/           # Hotel/Inn management
│   │   │   └── Inventory/      # Rooms, categories
│   │   ├── SeedWork/           # Base classes
│   │   └── Shared/             # Shared types
│   ├── DevInn.Application/     # Use cases
│   │   ├── Features/
│   │   │   ├── Auth/
│   │   │   ├── Bookings/
│   │   │   ├── Inns/
│   │   │   └── Inventory/
│   │   └── Common/
│   ├── DevInn.Infrastructure/  # External concerns
│   │   ├── Persistence/
│   │   ├── Identity/
│   │   └── Common/
│   └── DevInn.WebApi/         # API layer
│       ├── Endpoints/
│       ├── Middlewares/
│       └── Configuration/
├── tests/
├── docs/
│   └── TIMEZONE_BEST_PRACTICES.md
├── Makefile
└── compose.yaml
```

## Domain Model

### Core Aggregates

#### 1. Booking
Main aggregate for reservations:
- **Properties**: InnId, RoomId, StayPeriod, Guest, Occupancy, Status, Source, TotalValue
- **Entities**: Payment (child)
- **Value Objects**: StayPeriod, Guest, Occupancy, Money
- **Status**: Pending, Confirmed, CheckedIn, CheckedOut, Cancelled, NoShow

#### 2. Room
- **Properties**: Number, CategoryId, Status
- **Relationships**: Belongs to RoomCategory

#### 3. RoomCategory
- **Properties**: Name, Description, Capacity, BasePrice

#### 4. Inn
- **Properties**: Name, Address, TimeZoneId, TenantId
- **Multi-tenancy**: Each inn is a tenant

#### 5. Expense
- **Properties**: Description, Amount, Date, CategoryId
- **Relationships**: Belongs to ExpenseCategory

### Value Objects

#### StayPeriod
```csharp
public readonly record struct StayPeriod
{
    public DateTimeOffset CheckIn { get; private init; }
    public DateTimeOffset CheckOut { get; private init; }
    public int Nights => (CheckOut.Date - CheckIn.Date).Days;
}
```

#### Money
```csharp
public readonly record struct Money
{
    public decimal Value { get; private init; }
}
```

#### Guest
```csharp
public sealed class Guest
{
    public string Name { get; private set; }
    public string Phone { get; private set; }
    public string? Email { get; private set; }
    public string? Document { get; private set; }
    public DateOnly? BirthDate { get; private set; }
}
```

#### Occupancy
```csharp
public sealed class Occupancy
{
    public int Adults { get; private set; }
    public int Children { get; private set; }
    public IReadOnlyCollection<int> ChildrenAges { get; private set; }
}
```

## Development Commands

### Using Make (Recommended)

```bash
# From apps/api directory

# General
make setup              # Install tools and restore
make build              # Build solution
make clean              # Clean build artifacts

# Database - Application Context
make db-add V=001       # Add new migration
make db-update          # Apply migrations
make db-remove          # Remove last migration

# Database - Identity Context
make id-add V=001       # Add identity migration
make id-update          # Apply identity migrations
make migrate-all        # Apply all migrations

# Testing
make test               # Run all tests
make test-unit          # Run unit tests only
make test-coverage      # Run with coverage
```

### Using dotnet CLI

```bash
# Build
dotnet build src/DevInn.WebApi

# Run
dotnet run --project src/DevInn.WebApi
dotnet watch run --project src/DevInn.WebApi  # With hot reload

# Migrations
dotnet ef migrations add V001 \
  -p src/DevInn.Infrastructure \
  -s src/DevInn.WebApi \
  -c ApplicationDbContext \
  -o Persistence/Migrations

dotnet ef database update \
  -p src/DevInn.Infrastructure \
  -s src/DevInn.WebApi \
  -c ApplicationDbContext

# Tests
dotnet test tests/DevInn.Tests/DevInn.Tests.csproj
```

### Using pnpm (from root)

```bash
# From project root
pnpm dev:api            # Run API with watch
pnpm build:api          # Build API
```

## Feature Development Workflow

### 1. Create Domain Entity (if needed)

Location: `src/DevInn.Domain/Aggregates/{Aggregate}/`

```csharp
public sealed class Room : Entity
{
    public string Number { get; private set; }
    public Guid CategoryId { get; private set; }
    
    private Room() { } // EF Core
    
    public Room(string number, Guid categoryId)
    {
        Number = number;
        CategoryId = categoryId;
    }
}
```

### 2. Create EF Configuration

Location: `src/DevInn.Infrastructure/Persistence/Configurations/`

```csharp
internal sealed class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.ToTable("rooms");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).ValueGeneratedNever();
        builder.Property(r => r.Number).IsRequired().HasMaxLength(20);
    }
}
```

### 3. Create Migration

```bash
make db-add V=AddRoomsTable
make db-update
```

### 4. Create Command/Query

Location: `src/DevInn.Application/Features/{Feature}/`

**Command:**
```csharp
public sealed record CreateRoomCommand(
    string Number,
    Guid CategoryId
) : IRequest<Result<Guid>>;
```

**Query:**
```csharp
public sealed record GetRoomsQuery 
    : IRequest<Result<List<RoomDto>>>;
```

### 5. Create Handler

```csharp
internal sealed class CreateRoomHandler 
    : IRequestHandler<CreateRoomCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    
    public async Task<Result<Guid>> Handle(
        CreateRoomCommand command, 
        CancellationToken ct)
    {
        var room = new Room(command.Number, command.CategoryId);
        _context.Rooms.Add(room);
        await _context.SaveChangesAsync(ct);
        return Result.Success(room.Id);
    }
}
```

### 6. Create Validator (for commands)

```csharp
public sealed class CreateRoomValidator 
    : AbstractValidator<CreateRoomCommand>
{
    public CreateRoomValidator()
    {
        RuleFor(x => x.Number)
            .NotEmpty()
            .MaximumLength(20);
    }
}
```

### 7. Create Endpoint

Location: `src/DevInn.WebApi/Endpoints/{Feature}/`

```csharp
public sealed class CreateRoomEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/v1/rooms", Handle)
            .WithTags("Inventory")
            .RequireAuthorization()
            .Produces<Guid>(StatusCodes.Status201Created);
    }
    
    private static async Task<IResult> Handle(
        CreateRoomCommand command,
        ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return result.IsSuccess
            ? Results.Created($"/api/v1/rooms/{result.Value}", result.Value)
            : result.ToProblemDetails();
    }
}
```

## Common Patterns

### Timezone Handling

**CRITICAL:** Always follow timezone best practices documented in `docs/TIMEZONE_BEST_PRACTICES.md`.

Key rules:
- Database stores in UTC
- Domain uses `DateTimeOffset`
- Queries convert to UTC before comparing
- Validations use `DateTimeOffset.UtcNow`

```csharp
// In queries
var checkInUtc = checkIn.ToUniversalTime();
var bookings = await _context.Bookings
    .Where(b => b.StayPeriod.CheckIn >= checkInUtc)
    .ToListAsync(ct);

// In validations
RuleFor(x => x.CheckIn)
    .GreaterThanOrEqualTo(DateTimeOffset.UtcNow);
```

### Result Pattern

Use Result<T> for operation outcomes:

```csharp
public sealed record Result<T>
{
    public bool IsSuccess { get; init; }
    public T? Value { get; init; }
    public Error? Error { get; init; }
}

// Usage
var result = await sender.Send(command, ct);
if (result.IsSuccess)
{
    return Results.Ok(result.Value);
}
return Results.BadRequest(result.Error);
```

### Repository Pattern

```csharp
public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Booking booking, CancellationToken ct = default);
}
```

## API Endpoints Structure

### Current Endpoints

```
/api/v1/auth
  POST /register
  POST /login
  POST /refresh

/api/v1/room-categories
  GET    /
  GET    /{id}
  POST   /
  PUT    /{id}
  DELETE /{id}

/api/v1/rooms
  GET    /
  GET    /{id}
  POST   /
  PUT    /{id}

/api/v1/bookings
  GET    /
  GET    /{id}
  POST   /
  PUT    /{id}
  DELETE /{id}

/api/v1/expenses
  GET    /
  POST   /
```

### Endpoint Naming Conventions

- Use plural nouns: `/rooms` not `/room`
- Use kebab-case: `/room-categories` not `/roomCategories`
- Resource ID in path: `/rooms/{id}`
- Actions as verbs in query: `/bookings/{id}/check-in`

## Testing

### Unit Tests
Test domain logic and handlers in isolation.

### Integration Tests
Test endpoints with real database (test containers).

### Test Structure
```
tests/DevInn.Tests/
├── UnitTests/
│   ├── Domain/
│   └── Application/
└── IntegrationTests/
    └── Endpoints/
```

## Environment Configuration

### Development (appsettings.Development.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=devinn_dev;..."
  },
  "Jwt": {
    "Secret": "dev-secret-key-..."
  }
}
```

### Docker Compose (compose.yaml)
PostgreSQL service for local development.

## Scripts

For helper scripts, see `scripts/` directory:
- `generate-feature.ps1` - Generate complete feature structure
- `generate-migration.ps1` - Create and apply migrations

## Additional Resources

- Full timezone documentation: `docs/TIMEZONE_BEST_PRACTICES.md`
- Clean Architecture patterns: See `@dotnet-clean-arch` skill
- EF Core patterns: See `@ef-core-devinn` skill
