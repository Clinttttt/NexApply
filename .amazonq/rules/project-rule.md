
---

# NexApply — Project Rules & Best Practices

## Architecture
- Vertical Slice Architecture — every feature is a self-contained slice with its own handler, endpoint, and validator
- No shared service layers, no repositories, no horizontal tiers
- Inject `AppDbContext` directly into handlers — no abstraction over EF Core
- No business logic in endpoints — always go through MediatR handlers

## Slice Structure
Each slice folder contains exactly three files — handler (co-located with its command/query record), endpoint, and validator. Nothing more.

## Result Pattern
Use `Result<T>` for all handler responses. Never throw exceptions for expected failures like not found, unauthorized, or conflict. Exceptions are only for truly unexpected errors caught by the global middleware.

## Validation
Every command and query has a FluentValidation validator. Validators are auto-discovered via assembly scanning — never register them manually. The MediatR validation pipeline behavior runs before every handler.

## Error Handling
Global exception middleware handles everything. Never expose stack traces to the client. Map errors to the correct HTTP status codes — 400 for validation, 401 for auth, 403 for forbidden, 404 for not found, 409 for conflict.

## Authentication
JWT Bearer token in the Authorization header. Role claim embedded in the token. Read JWT config from environment variables — never hardcode secrets.

## Database
EF Core for all writes. Dapper or raw SQL only for read-heavy queries like resume matching and reports. Always use `DateTime.UtcNow` — never `DateTime.Now`. Always wrap multi-step writes in a transaction.

## HTTP Clients
Always use `IHttpClientFactory` — never instantiate `HttpClient` directly. This prevents socket exhaustion.

## Naming Conventions
- Handlers — `VerbNounHandler.cs`
- Endpoints — `VerbNounEndpoint.cs`
- Validators — `VerbNounValidator.cs`
- DTOs scoped to a feature stay in that feature folder. DTOs shared across features go in `Shared/DTOs/`

## Don't Reinvent the Wheel
- Use existing `Result<T>` — don't create new response wrappers
- Use existing `CurrentUser` service — don't read claims manually in endpoints
- Use existing `GlobalExceptionMiddleware` — don't add try/catch in handlers for expected errors
- Use existing `ValidationBehavior` pipeline — don't call validators manually

## Git Commits
Follow conventional commits — `feat(slice)`, `fix(slice)`, `refactor(slice)`, `chore`. One slice per commit where possible.

## General
- Don't over-engineer — if a simple direct solution works, use it
- One slice at a time — never build multiple slices in one go
- Review all DB migrations before applying — never auto-run
- CORS `AllowAll` is dev only — restrict to production domain on deploy