---
name: dotnet-clean-arch
description: Expert in .NET Clean Architecture development. Use this skill when working with .NET/C# projects that follow Clean Architecture patterns, including Domain-Driven Design (DDD), CQRS, and vertical slice architecture. Use when creating or modifying entities, aggregates, value objects, commands, queries, handlers, or implementing repository patterns.
---

# .NET Clean Architecture Development

Expert skill for developing .NET applications following Clean Architecture principles with DDD patterns.

## Project Structure

Follow this layered architecture:

```
Solution/
├── Domain/           # Core business logic (no dependencies)
│   ├── Aggregates/  # Domain entities and aggregates
│   ├── SeedWork/    # Base classes (Entity, ValueObject, etc.)
│   └── Shared/      # Shared domain types
├── Application/      # Use cases and business logic
│   ├── Features/    # Feature folders (vertical slices)
│   └── Common/      # Shared application logic
├── Infrastructure/   # External concerns
│   ├── Persistence/ # Database, repositories
│   ├── Identity/    # Authentication
│   └── Common/      # Other infrastructure
└── WebApi/          # API endpoints
    ├── Endpoints/   # Minimal API endpoints
    └── Common/      # API infrastructure
```

## Domain Layer Patterns

### Entities

Create sealed classes inheriting from `Entity` base class:

```csharp
public sealed class Room : Entity
{
    public string Number { get; private set; }
    public RoomCategory Category { get; private set; }
    public Guid CategoryId { get; private set; }
    
    private Room() { } // EF Core
    
    public Room(string number, Guid categoryId)
    {
        Number = number;
        CategoryId = categoryId;
    }
    
    public void UpdateNumber(string newNumber)
    {
        Number = newNumber;
    }
}
```

**Key patterns:**
- Use `sealed` classes
- Private setters for encapsulation
- Private parameterless constructor for EF Core
- Public constructor with required parameters
- Methods for mutations instead of public setters

### Value Objects

For domain concepts without identity:

```csharp
public readonly record struct StayPeriod
{
    public DateTimeOffset CheckIn { get; private init; }
    public DateTimeOffset CheckOut { get; private init; }
    
    public StayPeriod(DateTimeOffset checkIn, DateTimeOffset checkOut)
    {
        if (checkIn >= checkOut)
            throw new ArgumentException("Check-in must be before check-out");
            
        CheckIn = checkIn;
        CheckOut = checkOut;
    }
    
    public int Nights => (CheckOut.Date - CheckIn.Date).Days;
}
```

**Use `readonly record struct` for:**
- Immutable value objects
- Natural equality comparison
- Performance benefits

### Aggregates

Root entities that enforce business rules:

```csharp
public sealed class Booking : Entity
{
    private readonly List<Payment> _payments = [];
    
    public Guid RoomId { get; private set; }
    public StayPeriod StayPeriod { get; private set; }
    public IReadOnlyList<Payment> Payments => _payments.AsReadOnly();
    
    public void AddPayment(decimal amount, PaymentMethod method)
    {
        var payment = new Payment(Id, amount, method);
        _payments.Add(payment);
    }
}
```

**Key patterns:**
- Private collection with public readonly view
- Business rules enforced within aggregate
- Aggregate root controls access to child entities

## Application Layer Patterns

### Feature Organization

Organize code by features (vertical slices):

```
Features/
├── Inventory/
│   ├── CreateRoomCategory/
│   │   ├── CreateRoomCategoryCommand.cs
│   │   ├── CreateRoomCategoryHandler.cs
│   │   └── CreateRoomCategoryValidator.cs
│   └── GetRoomCategories/
│       ├── GetRoomCategoriesQuery.cs
│       └── GetRoomCategoriesHandler.cs
```

### Commands (Write Operations)

```csharp
public sealed record CreateRoomCategoryCommand(
    string Name,
    string Description,
    int Capacity
) : IRequest<Result<Guid>>;

internal sealed class CreateRoomCategoryHandler 
    : IRequestHandler<CreateRoomCategoryCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    
    public CreateRoomCategoryHandler(IApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<Result<Guid>> Handle(
        CreateRoomCategoryCommand command, 
        CancellationToken ct)
    {
        var category = new RoomCategory(
            command.Name,
            command.Description,
            command.Capacity
        );
        
        _context.RoomCategories.Add(category);
        await _context.SaveChangesAsync(ct);
        
        return Result.Success(category.Id);
    }
}
```

### Queries (Read Operations)

```csharp
public sealed record GetRoomCategoriesQuery 
    : IRequest<Result<List<RoomCategoryDto>>>;

internal sealed class GetRoomCategoriesHandler 
    : IRequestHandler<GetRoomCategoriesQuery, Result<List<RoomCategoryDto>>>
{
    private readonly IApplicationDbContext _context;
    
    public async Task<Result<List<RoomCategoryDto>>> Handle(
        GetRoomCategoriesQuery query, 
        CancellationToken ct)
    {
        var categories = await _context.RoomCategories
            .AsNoTracking()
            .Select(c => new RoomCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Capacity = c.Capacity
            })
            .ToListAsync(ct);
            
        return Result.Success(categories);
    }
}
```

### Validation

Use FluentValidation for command/query validation:

```csharp
public sealed class CreateRoomCategoryValidator 
    : AbstractValidator<CreateRoomCategoryCommand>
{
    public CreateRoomCategoryValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);
            
        RuleFor(x => x.Capacity)
            .GreaterThan(0)
            .LessThanOrEqualTo(10);
    }
}
```

## API Layer (Minimal APIs)

### Endpoint Definition

```csharp
public sealed class CreateRoomCategoryEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/v1/room-categories", Handle)
            .WithTags("Inventory")
            .RequireAuthorization()
            .Produces<Guid>(StatusCodes.Status201Created)
            .ProducesValidationProblem();
    }
    
    private static async Task<IResult> Handle(
        CreateRoomCategoryCommand command,
        ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        
        return result.IsSuccess
            ? Results.Created($"/api/v1/room-categories/{result.Value}", result.Value)
            : result.ToProblemDetails();
    }
}
```

## Best Practices

### Naming Conventions

- **Commands**: `{Verb}{Entity}Command` (e.g., `CreateRoomCommand`)
- **Queries**: `Get{Entity(s)}Query` (e.g., `GetRoomsQuery`)
- **Handlers**: `{CommandOrQuery}Handler`
- **Validators**: `{CommandOrQuery}Validator`
- **DTOs**: `{Entity}Dto` or `{Entity}Response`

### File Organization

- One class per file
- File name matches class name
- Group related files in feature folders
- Keep internal classes in the same namespace

### Access Modifiers

- Domain entities: `public sealed`
- Application handlers: `internal sealed`
- Infrastructure services: `internal sealed`
- API endpoints: `public sealed`

### Dependency Injection

```csharp
// Register by assembly scanning
services.AddMediatR(cfg => 
    cfg.RegisterServicesFromAssembly(typeof(ApplicationModule).Assembly));
    
services.AddValidatorsFromAssembly(typeof(ApplicationModule).Assembly);
```

### Error Handling

Use Result pattern for business logic errors:

```csharp
public sealed record Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public Error? Error { get; }
    
    public static Result<T> Success(T value) => new(true, value, null);
    public static Result<T> Failure(Error error) => new(false, default, error);
}
```

### Testing Structure

```
Tests/
├── UnitTests/
│   ├── Domain/
│   └── Application/
└── IntegrationTests/
    └── Endpoints/
```

## Common Commands

### Create new feature (manual)

1. Create feature folder in `Application/Features/{Aggregate}/{Feature}/`
2. Add command/query record
3. Add handler class
4. Add validator class (if command)
5. Add endpoint in `WebApi/Endpoints/{Aggregate}/`

### Database Migration

```bash
# From Infrastructure project
dotnet ef migrations add {MigrationName} --startup-project ../WebApi
dotnet ef database update --startup-project ../WebApi
```

## References

For detailed timezone handling patterns specific to this project, see `references/timezone-patterns.md`.
