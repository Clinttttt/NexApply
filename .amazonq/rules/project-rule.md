
---

# NexApply — Project Rules & Best Practices

## Architecture
- **Hybrid: Vertical Slice Architecture + Domain-Driven Design (DDD)**
- Every feature is a self-contained slice with its own handler, endpoint, and validator
- Domain logic lives in rich domain entities with behavior, not anemic data models
- Domain entities enforce invariants and business rules through methods, not public setters
- Repositories abstract data access for aggregates — inject repositories into handlers, not `AppDbContext`
- Domain services handle complex business logic that doesn't belong to a single entity
- No business logic in endpoints — always go through MediatR handlers
- Handlers orchestrate domain entities, repositories, and domain services

## Domain Layer (DDD)
- **Entities** — rich domain models with behavior, identity, and invariants
- **Value Objects** — immutable objects defined by their attributes (e.g., Email, Money, DateRange)
- **Aggregates** — cluster of entities with a root entity that enforces consistency boundaries
- **Domain Events** — capture significant business events (e.g., ApplicationSubmitted, JobListingPublished)
- **Domain Services** — stateless services for business logic spanning multiple entities
- **Repositories** — interfaces in domain layer, implementations in infrastructure layer

## Slice Structure
Each slice folder contains:
- **Handler** — orchestrates domain logic, calls repositories and domain services
- **Endpoint** — maps HTTP requests to MediatR commands/queries
- **Validator** — validates input using FluentValidation
- **DTOs** — request/response models (if needed for that slice)

Domain entities live in `Domain/` folder, organized by aggregate.

## Result Pattern
Use `Result<T>` for all handler responses. Never throw exceptions for expected failures like not found, unauthorized, or conflict. Exceptions are only for truly unexpected errors caught by the global middleware.

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
- Handlers — `VerbNounHandler.cs`
- Endpoints — `VerbNounEndpoint.cs`
- Validators — `VerbNounValidator.cs`
- Repositories — `I{Aggregate}Repository.cs` (interface), `{Aggregate}Repository.cs` (implementation)
- Domain Services — `{Context}DomainService.cs`
- Domain Events — `{Event}DomainEvent.cs`
- Value Objects — `{Name}.cs` (e.g., Email.cs, Money.cs)
- DTOs scoped to a feature stay in that feature folder. DTOs shared across features go in `Shared/DTOs/`

## Don't Reinvent the Wheel
- Use existing `Result<T>` — don't create new response wrappers
- Use existing `CurrentUser` service — don't read claims manually in endpoints
- Use existing `GlobalExceptionMiddleware` — don't add try/catch in handlers for expected errors
- Use existing `ValidationBehavior` pipeline — don't call validators manually
- Use repository interfaces — don't inject `AppDbContext` directly into handlers
- Keep domain entities rich — don't create anemic models with only getters/setters

## Git Commits
Follow conventional commits — `feat(slice)`, `fix(slice)`, `refactor(slice)`, `chore`. One slice per commit where possible.

## General
- Don't over-engineer — if a simple direct solution works, use it
- One slice at a time — never build multiple slices in one go
- Review all DB migrations before applying — never auto-run
- CORS `AllowAll` is dev only — restrict to production domain on deploy