# NexApply — Project Context

## Stack
- **API:** .NET 9 Web API (Minimal API)
- **Frontend:** Blazor Server 10
- **Database:** PostgreSQL via EF Core
- **Architecture:** Vertical Slice Architecture (VSA)
- **Auth:** JWT Bearer token in Authorization header
- **Validation:** FluentValidation + MediatR pipeline behavior
- **CQRS:** MediatR

---

## Architecture Rules
- Every feature is a self-contained slice — handler, endpoint, validator
- Command/Query record is co-located in the Handler file
- No repositories, no service layers, no horizontal tiers
- Inject `AppDbContext` directly into handlers
- No business logic in endpoints — always go through MediatR

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

**CurrentUser** — inject `CurrentUser` service to get the authenticated user's Id, Email, Role. Never read claims manually in endpoints.

**DateTime** — always use `DateTime.UtcNow`. Never `DateTime.Now` (PostgreSQL requires UTC).

**HttpClient** — always use `IHttpClientFactory`. Never instantiate `HttpClient` directly.

**Transactions** — wrap multi-step writes in `BeginTransactionAsync` + `CommitAsync`.

---

## Roles
| Role | Value |
|------|-------|
| Admin | `"Admin"` |
| Company | `"Company"` |
| Student | `"Student"` |

Role is stored as a string column on the `User` entity.

---

## Entities
- `User` — Id, Email, Username, PasswordHash, RefreshToken, RefreshTokenExpiry, Role, IsActive, CreatedAt
- `CompanyProfile` — Id, UserId FK, CompanyName, Description, Website, LogoUrl, Industry, Location
- `StudentProfile` — Id, UserId FK, FullName, University, Course, GraduationYear, ResumeFilePath, ParsedResumeText
- `JobListing` — Id, CompanyId FK, Title, Description, RequiredSkills, Location, JobType, Status, Deadline, CreatedAt
- `Application` — Id, StudentId FK, JobListingId FK, CoverLetter, ResumeUrl, Status, AppliedAt

---

## Enums (stored as strings)
- `JobType` — FullTime, PartTime, Internship, Freelance, Remote
- `JobListingStatus` — Pending, Approved, Rejected
- `ApplicationStatus` — Submitted, UnderReview, Shortlisted, ForInterview, Declined

---

## Prompt Template
```
Context: Vertical Slice Architecture, .NET 9 Minimal API, MediatR, EF Core (no repositories), PostgreSQL.

Feature: [feature name]
Slice: [verb + noun]
Fields: [describe command/query fields]

Generate:
1. Command/Query record + Handler (one file)
2. FluentValidation validator
3. Minimal API endpoint (static class, WebApplication extension method)

Rules:
- Use Result<T> pattern
- Inject AppDbContext directly
- No service classes, no repositories
- Use DateTime.UtcNow
```