# NexApply — Project Context

## Stack
- **API:** .NET 9 Web API (Minimal API)
- **Frontend:** Blazor Server 10
- **Database:** PostgreSQL via EF Core
- **Contracts:** Shared layer for DTOs, Commands, Queries, Result<T>
- **Architecture:** Vertical Slice Architecture (VSA) + DDD
- **Auth:** JWT Bearer token in Authorization header
- **Validation:** FluentValidation + MediatR pipeline behavior
- **CQRS:** MediatR

---

## Project Structure

```
NexApply/
├── NexApply.Api/          ← Backend (Handlers, Endpoints, Validators, Entities, DbContext)
├── NexApply.Client/       ← Frontend (Blazor Server, Pages, Components, Services)
├── NexApply.Contracts/    ← Shared (DTOs, Commands, Queries, Result<T>, Enums)
└── NexApply.Tests/        ← Tests (Integration, Unit)
```

### Dependencies
- **Client** → references **Contracts** (NOT Api)
- **Api** → references **Contracts**
- **Tests** → references **Api**

---

## Architecture Rules
- Every feature is a self-contained slice — handler, endpoint, validator
- **Commands/Queries** live in **NexApply.Contracts** (shared between Client and Api)
- **Handlers** live in **NexApply.Api** (business logic)
- **DTOs** live in **NexApply.Contracts** (shared data contracts)
- Inject `AppDbContext` directly into handlers
- No business logic in endpoints — always go through MediatR
- Entities follow DDD with private setters and factory methods

## Slice Structure
```
NexApply.Contracts/
└── FeatureName/
    ├── VerbNounCommand.cs     ← Command/Query record (IRequest<Result<T>>)
    └── VerbNounDto.cs         ← Response DTO (if needed)

NexApply.Api/
└── Features/
    └── FeatureName/
        └── VerbNoun/
            ├── VerbNounHandler.cs     ← Handler (IRequestHandler)
            ├── VerbNounEndpoint.cs    ← Static class, WebApplication extension method
            └── VerbNounValidator.cs   ← FluentValidation validator
```

---

## Key Patterns

**Result<T>** — all handlers return `Result<T>` (from `NexApply.Contracts.Common`). Never throw for expected failures.
Available: `Success`, `Failure`, `NotFound`, `Unauthorized`, `Forbidden`, `Conflict`, `NoContent`, `ValidationFailure`

**ResultExtensions.ToIResult()** — ALWAYS use in endpoints to convert Result<T> to IResult:
```csharp
using NexApply.Contracts.Common;
using NexApply.Contracts.Auth;

app.MapPost("/api/endpoint", async (Command cmd, IMediator mediator) =>
{
    var result = await mediator.Send(cmd);
    return ResultExtensions.ToIResult(result);
});
```

**Commands/Queries** — always define in `NexApply.Contracts` as records implementing `IRequest<Result<T>>`:
```csharp
using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.FeatureName;

public record VerbNounCommand(string Field1, int Field2) : IRequest<Result<ResponseDto>>;
```

**DTOs** — define in `NexApply.Contracts` for shared data contracts:
```csharp
namespace NexApply.Contracts.FeatureName;

public class ResponseDto
{
    public string? Property1 { get; set; }
    public int Property2 { get; set; }
}
```

**CurrentUser** — inject `CurrentUser` service to get the authenticated user's Id, Email, Role. Never read claims manually in endpoints.

**DateTime** — always use `DateTime.UtcNow`. Never `DateTime.Now` (PostgreSQL requires UTC).

**HttpClient** — always use `IHttpClientFactory`. Never instantiate `HttpClient` directly.

**Transactions** — wrap multi-step writes in `BeginTransactionAsync` + `CommitAsync`.

**DDD Entities** — use factory methods (e.g., `User.CreateStudent()`) and domain methods (e.g., `user.UpdateRefreshToken()`). Never set properties directly.

---

## Roles
| Role | Enum |
|------|------|
| Company | `UserRole.Company` |
| Student | `UserRole.Student` |

Role is stored as enum converted to string in database.

---

## Entities (DDD)
- `BaseEntity` — Id (Guid), CreatedAt, UpdatedAt
- `User` — Email, Username, PasswordHash, RefreshToken, RefreshTokenExpiry, Role, IsActive
- `CompanyProfile` — UserId FK, CompanyName, Description, Website, LogoUrl, Industry, Location
- `StudentProfile` — UserId FK, FullName, Phone, Location, University, Course, GraduationYear, LinkedIn, GitHub, Portfolio, ResumeFilePath, ParsedResumeText
- `JobListing` — CompanyId FK, Title, Description, Responsibilities, Qualifications, RequiredSkills, Benefits, Location, JobType, WorkSetup, SalaryMin, SalaryMax, ExperienceLevel, Openings, Deadline, Status
- `Application` — StudentId FK, JobListingId FK, CoverLetter, ResumeUrl, Status, RecruiterNotes
- `SavedJob` — StudentId FK, JobListingId FK

---

## Enums
- `UserRole` — Student, Company (in `NexApply.Contracts.Enums`)
- `JobType` — FullTime, PartTime, Internship, Freelance, Remote (in `NexApply.Api.Entities.Enums`)
- `WorkSetup` — OnSite, Remote, Hybrid (in `NexApply.Api.Entities.Enums`)
- `ApplicationStatus` — Submitted, UnderReview, Shortlisted, ForInterview, Declined (in `NexApply.Api.Entities.Enums`)
- `JobListingStatus` — Active, Paused, Closed (in `NexApply.Api.Entities.Enums`)

**Note:** `UserRole` is in Contracts because it's shared between Client and Api. Other enums stay in Api as they're domain-specific.

---

## Prompt Template
```
Context: Vertical Slice Architecture, .NET 9 Minimal API, MediatR, EF Core, PostgreSQL, DDD, Contracts layer.

Feature: [feature name]
Slice: [verb + noun]
Fields: [describe command/query fields]

Generate:
1. Command/Query record in NexApply.Contracts (IRequest<Result<T>>)
2. Response DTO in NexApply.Contracts (if needed)
3. Handler in NexApply.Api (IRequestHandler)
4. FluentValidation validator in NexApply.Api
5. Minimal API endpoint in NexApply.Api (static class, WebApplication extension method)

Rules:
- Commands/Queries go in NexApply.Contracts
- Handlers, Validators, Endpoints go in NexApply.Api
- Use Result<T> from NexApply.Contracts.Common
- Use ResultExtensions.ToIResult() in endpoints
- Inject AppDbContext directly into handlers
- Use DDD entity methods (factory methods, domain methods)
- Use DateTime.UtcNow
- Never set entity properties directly
- Import from NexApply.Contracts.Common and NexApply.Contracts.FeatureName
```