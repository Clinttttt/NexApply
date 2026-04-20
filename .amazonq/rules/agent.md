# NexApply — Project Context

## Stack
- **API:** .NET 9 Web API (Minimal API)
- **Frontend:** Blazor Server 10
- **Database:** PostgreSQL via EF Core
- **Architecture:** Vertical Slice Architecture (VSA) + DDD
- **Auth:** JWT Bearer token in Authorization header
- **Validation:** FluentValidation + MediatR pipeline behavior
- **CQRS:** MediatR

---

## Architecture Rules
- Every feature is a self-contained slice — handler, endpoint, validator
- Command/Query record is co-located in the Handler file
- Inject `AppDbContext` directly into handlers
- No business logic in endpoints — always go through MediatR
- Entities follow DDD with private setters and factory methods

## Slice Structure
```
Features/
└── FeatureName/
    └── VerbNoun/
        ├── VerbNounHandler.cs     ← Command/Query record + Handler
        ├── VerbNounEndpoint.cs    ← Static class, WebApplication extension method
        └── VerbNounValidator.cs   ← FluentValidation validator
```

---

## Key Patterns

**Result<T>** — all handlers return `Result<T>`. Never throw for expected failures.
Available: `Success`, `Failure`, `NotFound`, `Unauthorized`, `Forbidden`, `Conflict`, `NoContent`, `ValidationFailure`

**ResultExtensions.ToIResult()** — ALWAYS use in endpoints to convert Result<T> to IResult:
```csharp
app.MapPost("/api/endpoint", async (Command cmd, IMediator mediator) =>
{
    var result = await mediator.Send(cmd);
    return ResultExtensions.ToIResult(result);
});
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

## Enums (in Entities/Enums/)
- `UserRole` — Student, Company
- `JobType` — FullTime, PartTime, Internship, Freelance, Remote
- `WorkSetup` — OnSite, Remote, Hybrid
- `ApplicationStatus` — Submitted, UnderReview, Shortlisted, ForInterview, Declined
- `JobListingStatus` — Active, Paused, Closed

---

## Prompt Template
```
Context: Vertical Slice Architecture, .NET 9 Minimal API, MediatR, EF Core, PostgreSQL, DDD.

Feature: [feature name]
Slice: [verb + noun]
Fields: [describe command/query fields]

Generate:
1. Command/Query record + Handler (one file)
2. FluentValidation validator
3. Minimal API endpoint (static class, WebApplication extension method)

Rules:
- Use Result<T> pattern
- Use ResultExtensions.ToIResult() in endpoints
- Inject AppDbContext directly
- Use DDD entity methods (factory methods, domain methods)
- Use DateTime.UtcNow
- Never set entity properties directly
```