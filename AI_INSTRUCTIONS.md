# NexApply — Architecture & Implementation Rules (Quick Guide)

This file is the **entry point** for how we build features in this repo. It summarizes the project architecture and links to the detailed rule docs under `.amazonq/rules/`.

---

## 1) What this project is
NexApply is a **two-sided job & internship portal**:
- **Students** browse jobs, apply, track pipeline status, manage profile/resume.
- **Companies** post/manage listings, review applicants, move stages, schedule interviews, message.

See: `.amazonq/rules/project.md`

---

## 2) Repo structure (high level)
- `NexApply.Api/` — .NET 9 Minimal API backend (EF Core + PostgreSQL, MediatR, FluentValidation)
- `NexApply.Contracts/` — shared contracts (Commands/Queries/DTOs + `Result<T>`)
- `NexApply.Web/` — **current** frontend (React + TypeScript + Vite + Tailwind)
- `NexApply.Tests/` — tests

See: `.amazonq/rules/agent.md` and `.amazonq/rules/project-rule.md`

---

## 3) Golden rules (apply to every feature)
**Architecture**
- Use **Vertical Slice Architecture (VSA)**: each feature = a self-contained slice (endpoint + handler + validator).
- **Commands/Queries + DTOs go in `NexApply.Contracts`**.
- **Handlers/Endpoints/Validators go in `NexApply.Api`**.
- Endpoints should be thin: **no business logic in endpoints** → always call MediatR.

**Result pattern**
- Handlers return `Result<T>` (no exceptions for expected failures).
- Endpoints convert results via `ResultExtensions.ToIResult(...)`.

**Validation**
- Every Command/Query should have a FluentValidation validator (auto-discovered via assembly scanning).

**Auth & user**
- Use cookie-based JWT flow on the client; do not store tokens manually in localStorage.
- On backend, use the existing `CurrentUser` service (don’t manually parse claims in endpoints).

**Time**
- Use `DateTime.UtcNow` (never `DateTime.Now`).

See: `.amazonq/rules/project-rule.md` and `.amazonq/rules/agent.md`

---

## 4) Adding a backend feature slice (checklist)
**Goal:** add an API capability in the standard NexApply pattern.

1. **Contracts first** (`NexApply.Contracts/<Feature>/...`)
   - Add `...Command` or `...Query` as a record implementing `IRequest<Result<T>>`
   - Add/extend response DTOs if needed

2. **API implementation** (`NexApply.Api/Features/<Feature>/<VerbNoun>/...`)
   - `...Handler.cs` (business logic, orchestrates entities/services)
   - `...Validator.cs` (FluentValidation)
   - `...Endpoint.cs` (maps route → mediator → `ResultExtensions.ToIResult`)

3. **Map endpoints**
   - Ensure the feature endpoints are mapped (commonly via `app.Map<Feature>Endpoints()` in `Program.cs`).

4. **Tests**
   - Add/update tests in `NexApply.Tests/` (integration/unit depending on scope).

See: `.amazonq/rules/project-rule.md` and `.amazonq/rules/agent.md`

---

## 5) Wiring a frontend page to a backend endpoint (React)
**Goal:** call a backend endpoint from `NexApply.Web` in the existing style.

Follow this recipe:
1. Add/confirm TS types (`src/types/index.ts` and/or service file)
   - Guid → `string`, DateTime → `string` (ISO 8601)
2. Add method to the relevant service in `src/services/*`
   - Use `src/lib/apiClient.ts` (not raw axios)
   - Return `Result<T>` shape and wrap calls in try/catch with consistent error extraction
3. Update page/component in `src/pages/*`
   - Manage loading/error/data states
   - Respect auth rules (ProtectedRoute + cookie-based tokens)

See: `.amazonq/rules/Wiring_up_Frontend_Endpoint.md`, `.amazonq/rules/auth-pattern.md`

---

## 6) UI consistency rules (React)
When implementing/adjusting UI, follow these design/layout conventions:
- **Design system (colors, typography, spacing):** `.amazonq/rules/design-system.md`
- **Layout widths (sidebar + 3-column browse layout):** `.amazonq/rules/layout-widths.md`
- **Application pipeline colors/states:** `.amazonq/rules/pipeline-colors.md`

---

## 7) Client architecture docs (important note)
There are two client architecture docs:
- `.amazonq/rules/react-client-architecture.md` — **CURRENT** (React + TypeScript)
- `.amazonq/rules/client-architecture.md` — **DEPRECATED** (old Blazor client)

When in doubt, follow the **React** one.

---

## 8) Index of rule documents
- `.amazonq/rules/project.md` — product overview: roles + core features
- `.amazonq/rules/agent.md` — quick project context + key backend patterns (Result, slice structure)
- `.amazonq/rules/project-rule.md` — authoritative architecture + conventions (Contracts/Api split, naming, rules)
- `.amazonq/rules/auth-pattern.md` — cookie-based auth rules + refresh flow
- `.amazonq/rules/Wiring_up_Frontend_Endpoint.md` — how to connect UI ↔ API in React
- `.amazonq/rules/react-client-architecture.md` — React structure + patterns (services/hooks/result)
- `.amazonq/rules/design-system.md` — colors/typography/spacing/shadows
- `.amazonq/rules/layout-widths.md` — fixed widths + grid layouts
- `.amazonq/rules/pipeline-colors.md` — application status pipeline visual rules

