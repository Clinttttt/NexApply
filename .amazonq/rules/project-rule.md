
---

# NexApply — Project Rules & Best Practices

## Architecture
- **Hybrid: Vertical Slice Architecture + Domain-Driven Design (DDD) + Contracts Layer**
- Every feature is a self-contained slice with its own handler, endpoint, and validator
- **Commands/Queries and DTOs** live in **NexApply.Contracts** (shared between Client and Api)
- **Handlers** live in **NexApply.Api** (business logic)
- Domain logic lives in rich domain entities with behavior, not anemic data models
- Domain entities enforce invariants and business rules through methods, not public setters
- Repositories abstract data access for aggregates — inject repositories into handlers, not `AppDbContext`
- Domain services handle complex business logic that doesn't belong to a single entity
- No business logic in endpoints — always go through MediatR handlers
- Handlers orchestrate domain entities, repositories, and domain services

## Project Layers

### NexApply.Contracts (Shared Layer)
- **Commands/Queries** — MediatR requests implementing `IRequest<Result<T>>`
- **DTOs** — data transfer objects for requests and responses
- **Result<T>** — unified response wrapper
- **Shared Enums** — enums used across Client and Api (e.g., `UserRole`)
- **Dependencies:** MediatR.Contracts only
- **Referenced by:** NexApply.Client, NexApply.Api

### NexApply.Api (Backend)
- **Handlers** — implement `IRequestHandler<TCommand, Result<T>>`
- **Endpoints** — Minimal API endpoints mapping HTTP to MediatR
- **Validators** — FluentValidation validators for commands/queries
- **Entities** — DDD domain entities with behavior
- **Repositories** — data access abstractions
- **DbContext** — EF Core database context
- **Dependencies:** NexApply.Contracts, MediatR, FluentValidation, EF Core, Npgsql

### NexApply.Client (Frontend)
- **Pages/Components** — Blazor Server UI
- **Services** — HTTP clients calling Api endpoints
- **Dependencies:** NexApply.Contracts (NOT NexApply.Api)
- **Never reference NexApply.Api** — use Contracts for shared types

## Domain Layer (DDD)
- **Entities** — rich domain models with behavior, identity, and invariants
- **Value Objects** — immutable objects defined by their attributes (e.g., Email, Money, DateRange)
- **Aggregates** — cluster of entities with a root entity that enforces consistency boundaries
- **Domain Events** — capture significant business events (e.g., ApplicationSubmitted, JobListingPublished)
- **Domain Services** — stateless services for business logic spanning multiple entities
- **Repositories** — interfaces in domain layer, implementations in infrastructure layer

## Slice Structure

### In NexApply.Contracts
```
FeatureName/
├── VerbNounCommand.cs     ← Command/Query (IRequest<Result<T>>)
└── VerbNounDto.cs         ← Response DTO (if needed)
```

### In NexApply.Api
```
Features/
└── FeatureName/
    └── VerbNoun/
        ├── VerbNounHandler.cs     ← Handler (IRequestHandler)
        ├── VerbNounEndpoint.cs    ← Minimal API endpoint
        └── VerbNounValidator.cs   ← FluentValidation validator
```

### Example: Login Feature
```
NexApply.Contracts/Auth/
├── LoginCommand.cs          ← public record LoginCommand(string Username, string Password) : IRequest<Result<TokenResponseDto>>
└── TokenResponseDto.cs      ← public class TokenResponseDto { AccessToken, RefreshToken }

NexApply.Api/Features/Auth/Login/
├── LoginHandler.cs          ← IRequestHandler<LoginCommand, Result<TokenResponseDto>>
├── LoginValidator.cs        ← AbstractValidator<LoginCommand>
└── LoginEndpoint.cs         ← MapPost("/api/auth/login", ...)
```

Domain entities live in `Api/Entities/` folder, organized by aggregate.

## Result Pattern
Use `Result<T>` from `NexApply.Contracts.Common` for all handler responses. Never throw exceptions for expected failures like not found, unauthorized, or conflict. Exceptions are only for truly unexpected errors caught by the global middleware.

```csharp
using NexApply.Contracts.Common;

public async Task<Result<TokenResponseDto>> Handle(LoginCommand request, CancellationToken ct)
{
    var user = await context.Users.FirstOrDefaultAsync(u => u.Username == request.Username, ct);
    if (user is null) return Result<TokenResponseDto>.Unauthorized();
    // ...
    return Result<TokenResponseDto>.Success(tokenResponse);
}
```

## Validation
Every command and query has a FluentValidation validator. Validators are auto-discovered via assembly scanning — never register them manually. The MediatR validation pipeline behavior runs before every handler.

## Error Handling
Global exception middleware handles everything. Never expose stack traces to the client. Map errors to the correct HTTP status codes — 400 for validation, 401 for auth, 403 for forbidden, 404 for not found, 409 for conflict.

## Authentication
JWT Bearer token in the Authorization header. Role claim embedded in the token. Read JWT config from environment variables — never hardcode secrets.

## Database
EF Core for all writes and reads. Repositories encapsulate EF Core DbContext access. Always use `DateTime.UtcNow` — never `DateTime.Now`. Always wrap multi-step writes in a transaction. Domain entities are mapped to database tables via EF Core configurations.

## HTTP Clients
Always use `IHttpClientFactory` — never instantiate `HttpClient` directly. This prevents socket exhaustion.

## Naming Conventions
- **Commands/Queries** — `VerbNounCommand.cs` or `VerbNounQuery.cs` (in NexApply.Contracts)
- **DTOs** — `NounDto.cs` or `NounResponseDto.cs` (in NexApply.Contracts)
- **Handlers** — `VerbNounHandler.cs` (in NexApply.Api)
- **Endpoints** — `VerbNounEndpoint.cs` (in NexApply.Api)
- **Validators** — `VerbNounValidator.cs` (in NexApply.Api)
- **Repositories** — `I{Aggregate}Repository.cs` (interface), `{Aggregate}Repository.cs` (implementation)
- **Domain Services** — `{Context}DomainService.cs`
- **Domain Events** — `{Event}DomainEvent.cs`
- **Value Objects** — `{Name}.cs` (e.g., Email.cs, Money.cs)
- **Shared Enums** — in `NexApply.Contracts.Enums` if used by Client, otherwise in `NexApply.Api.Entities.Enums`

## Don't Reinvent the Wheel
- Use existing `Result<T>` from `NexApply.Contracts.Common` — don't create new response wrappers
- Use existing `CurrentUser` service — don't read claims manually in endpoints
- Use existing `GlobalExceptionMiddleware` — don't add try/catch in handlers for expected errors
- Use existing `ValidationBehavior` pipeline — don't call validators manually
- Use repository interfaces — don't inject `AppDbContext` directly into handlers
- Keep domain entities rich — don't create anemic models with only getters/setters
- **Commands/Queries go in Contracts** — never define them in Api handlers
- **Client references Contracts, NOT Api** — never add Api reference to Client

## Git Commits
Follow conventional commits — `feat(slice)`, `fix(slice)`, `refactor(slice)`, `chore`. One slice per commit where possible.

## General
- Don't over-engineer — if a simple direct solution works, use it
- One slice at a time — never build multiple slices in one go
- Review all DB migrations before applying — never auto-run
- CORS `AllowAll` is dev only — restrict to production domain on deploy