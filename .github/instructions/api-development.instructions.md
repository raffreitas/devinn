---
applyTo: './apps/api/**'
name: API Development Guidelines
description: Guidelines for developing and maintaining the API codebase.
---

# DevInn API - AI Coding Instructions

## Architecture Overview

This is a .NET 10 multi-tenant hotel management API following **Clean Architecture** with vertical slice organization:

- **Domain** (`DevInn.Domain`): Entities inherit from `Entity` base class which includes `InnId` for tenant isolation. Use `Guid.CreateVersion7()` for IDs.
- **Application** (`DevInn.Application`): Features organized by domain concept (e.g., `Features/Inns`, `Features/Auth`), not technical layers.
- **Infrastructure** (`DevInn.Infrastructure`): Dual-context EF Core setup - `ApplicationDbContext` for business data, `IdentityDbContext` for auth.
- **WebApi** (`DevInn.WebApi`): Minimal APIs with auto-registration pattern.

## Multi-Tenancy System

**Critical**: All entities automatically receive `InnId` via `TenantInterceptors` on save. The tenant is resolved in this priority:

1. `X-Tenant-Id` header
2. JWT claims: `tenant_id` or `inn_id`

Public paths bypass tenant checks: `/health`, `/scalar`, `/openapi`, `/api/v1/auth/login`

See [TenantMiddleware.cs](src/DevInn.WebApi/Middlewares/TenantMiddleware.cs) for the complete flow.

## Adding New Features

Use the **Feature Pattern** (vertical slices):

```csharp
// 1. Application/Features/{Domain}/{Feature}Feature.cs
public static class InnFeature
{
    public static IServiceCollection AddInnFeature(this IServiceCollection services)
    {
        services.AddScoped<ICreateInnUseCase, CreateInnUseCase>();
        return services;
    }
}

// 2. Application/Features/{Domain}/{Action}/{Action}UseCase.cs
public interface ICreateInnUseCase : IUseCase<CreateInnInput, Result<Guid>>;

internal sealed class CreateInnUseCase(IInnRepository repo, IUnitOfWork uow) : ICreateInnUseCase
{
    public async ValueTask<Result<Guid>> ExecuteAsync(CreateInnInput input, CancellationToken ct)
    {
        // Always validate input first
        var validationResult = input.Validate();
        if (validationResult.IsFailure) return Result.Fail(validationResult.ToError());

        // Business logic...
        await uow.CommitAsync(ct);
        return Result.Ok(entity.Id);
    }
}

// 3. WebApi/Endpoints/{Domain}/{Action}Endpoint.cs
public sealed class CreateInnEndpoint : IEndpoint
{
    private const string Route = "api/v1/inns";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(Route, async (CreateInnInput input, ICreateInnUseCase uc, CancellationToken ct) =>
            {
                var result = await uc.ExecuteAsync(input, ct);
                return result.ToCreated($"{Route}/{result.Value}");
            })
            .WithTags(Tags.Inns)
            .Produces<ApiResource<Guid>>(201)
            .Produces<ApiProblemDetails>(400);
    }
}

// 4. Register in ApplicationModule.cs
services.AddInnFeature();
```

**Endpoints auto-register** via reflection - just implement `IEndpoint` and it's discovered.

## Error Handling Pattern

Use `FluentResults` for domain outcomes. Map errors in endpoints using extension methods:

- `.ToOk()` → 200 with `ApiResource<T>`
- `.ToCreated(location)` → 201
- `.ToNoContent()` → 204

Errors map to HTTP status codes:
- `NotFoundError` → 404
- `ValidationError` → 422
- `UnauthorizedError` → 401
- `ForbiddenError` → 403

See [ResultExtensions.cs](src/DevInn.WebApi/Common/ResultExtensions.cs#L32-L47) for the complete mapping.

## Database Migrations

**Dual-context workflow** - use separate commands for app vs. identity data:

```bash
# Application data migrations
make db-add V=001          # Add migration
make db-update             # Apply migrations

# Identity data migrations
make id-add V=001          # Add identity migration
make id-update             # Apply identity migrations

# Apply all
make migrate-all
```

Migrations project: `src/DevInn.Infrastructure`
Startup project: `src/DevInn.WebApi`

## Key Dependencies

- **EF Core 10** with PostgreSQL + snake_case conventions
- **FluentValidation** for input validation (`.Validate()` method)
- **FluentResults** for railway-oriented programming
- **ASP.NET Identity** for authentication
- **JWT Bearer** tokens with tenant claims
- **Scalar** for API documentation (dev only)

## Naming Conventions

- Domain entities: Constructor-initialized, private setters
- Use cases: `{Action}UseCase` pattern with interface
- Endpoints: `{Action}Endpoint` implementing `IEndpoint`
- Routes: `api/v{version}/{resource}`
- Feature modules: `Add{Domain}Feature()` extension methods

## Development Workflow

```bash
make setup          # Install tools + restore packages
make build          # Build solution
make test           # Run tests (when implemented)

# Run with Docker Compose (PostgreSQL on port 5432)
docker compose up -d
dotnet run --project src/DevInn.WebApi
```

Connection string: `appsettings.Development.json` → `DefaultConnection`

## Important Notes

- All use cases must validate input via `.Validate()` before proceeding
- Domain entities use `Entity` base class - don't manually set `InnId`, `CreatedAt`, `UpdatedAt`
- Repository pattern via scoped interfaces (e.g., `IInnRepository`)
- Commit via `IUnitOfWork.CommitAsync()`, not directly on context
- JWT tokens should include `tenant_id` or `inn_id` claim for automatic tenant resolution
