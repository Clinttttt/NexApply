# Prompt — Create/Reuse API Endpoint From Page (NexApply)

Read **`AI_INSTRUCTIONS.md`** first and follow it strictly (architecture, Result pattern, Contracts/API split, naming, auth, etc.).

## Context
You are working in the NexApply repository (full-stack: `NexApply.Api` + `NexApply.Contracts` + `NexApply.Web`).

## Input
- Page (React) file path: **`[PASTE_PATH_TO_PAGE_TSX]`**
- Optional: screenshot(s) of the page UI + expected behavior.

## Task
1. **Understand the UI requirements** from the page code and/or screenshot(s):
   - What data is displayed?
   - What actions are triggered (create/update/delete/status change/etc.)?
   - What filters/sort/pagination are needed?
   - What role is required (Student / Company / Public)?

2. **Check whether the backend API already exists**:
   - Search `NexApply.Api/Features/**` and route mappings (and Swagger routes if needed) for an existing endpoint that matches the UI needs.
   - If an API exists, **reuse it** (do not create a duplicate). Only extend it if the UI requires missing fields/filters.

3. If the API does **not** exist, **implement it in the NexApply standard architecture**:
   - **Contracts**: add Command/Query + DTOs in `NexApply.Contracts/<Feature>/...` implementing `IRequest<Result<T>>`.
   - **API**: add a vertical slice under `NexApply.Api/Features/<Feature>/<VerbNoun>/`:
     - `...Handler.cs` (business logic)
     - `...Validator.cs` (FluentValidation)
     - `...Endpoint.cs` (Minimal API mapping → MediatR → `ResultExtensions.ToIResult`)
   - Add/adjust **Entities/Enums** only if required by the UI; add EF Core migration if schema changes.
   - Use `CurrentUser` (don’t manually parse claims). Use `DateTime.UtcNow`.
   - Return `Result<T>` for expected failures; don’t throw for normal errors.

4. **Wire the frontend to the endpoint** (if the page isn’t connected yet):
   - Add/confirm TypeScript types (Guid → `string`, DateTime → `string` ISO).
   - Add/extend a method in the appropriate `NexApply.Web/src/services/*Service.ts` using `src/lib/apiClient.ts` (not raw axios).
   - Update the page to load real data (`useEffect` or React Query), and implement loading/error/empty states.
   - Follow the auth rules: no token storage in localStorage; use existing cookie/interceptor setup.

5. **Add tests** as appropriate:
   - Integration tests in `NexApply.Tests` for the endpoint (use the existing `TestWebApplicationFactory`).

## Output requirements
- List the files you changed/added, with short rationale for each.
- Ensure code compiles (no placeholders) and naming matches repo conventions.
- If you introduced a migration, include its name and what it changes.

## Notes
- Prefer minimal, consistent changes over over-engineering.
- If the page currently uses mock data, replace it with API-backed data without changing the UI design unless necessary.
- If requirements are unclear, **re-check the page code** and/or request a **screenshot + the exact user flow** (what the user clicks, what should happen, and what data must appear). Ask only the minimum clarifying questions needed before implementing.
