# NexApply Client Architecture Pattern

## Overview
Blazor Server application following clean architecture principles with API service layer, component-based UI, and centralized state management.

---

## Project Structure

```
NexApply.Client/
├── Components/
│   ├── Layout/              ← Shared layout components (Sidebar, Header, etc.)
│   └── Pages/               ← Routable pages (@page directive)
├── Services/                ← API service implementations
│   ├── Auth/
│   └── Profile/
├── Interfaces/              ← Service interfaces
├── Securities/              ← Auth-related services (TokenService, AuthStateProvider, etc.)
├── Extensions/              ← Extension methods (HttpClientExtensions, etc.)
├── Helper/                  ← Base classes (HandleResponse, etc.)
└── wwwroot/                 ← Static assets (CSS, JS, images)
```

---

## Adding a New Feature (Step-by-Step)

### Step 1: Create Service Interface
**Location:** `Interfaces/I{Feature}ApiService.cs`

```csharp
using NexApply.Contracts.Common;
using NexApply.Contracts.{Feature}.Commands;
using NexApply.Contracts.{Feature}.Queries;
using NexApply.Contracts.{Feature}.Dtos;

namespace NexApply.Client.Interfaces;

public interface I{Feature}ApiService
{
    Task<Result<{Response}Dto>> Get{Entity}();
    Task<Result<{Response}Dto>> Create{Entity}({Create}Command request);
    Task<Result<{Response}Dto>> Update{Entity}({Update}Command request);
    Task<Result<bool>> Delete{Entity}(Guid id);
}
```

**Rules:**
- One interface per feature area
- All methods return `Task<Result<T>>`
- Use DTOs from `NexApply.Contracts`
- Method names follow CRUD pattern: Get, Create, Update, Delete

---

### Step 2: Create Service Implementation
**Location:** `Services/{Feature}/{Feature}ApiService.cs`

```csharp
using NexApply.Contracts.Common;
using NexApply.Contracts.{Feature}.Commands;
using NexApply.Contracts.{Feature}.Queries;
using NexApply.Contracts.{Feature}.Dtos;
using NexApply.Client.Helper;
using NexApply.Client.Interfaces;

namespace NexApply.Client.Services.{Feature};

public class {Feature}ApiService : HandleResponse, I{Feature}ApiService
{
    public {Feature}ApiService(HttpClient http) : base(http) { }

    public async Task<Result<{Response}Dto>> Get{Entity}() 
        => await GetAsync<{Response}Dto>("api/{feature}/{entity}");

    public async Task<Result<{Response}Dto>> Create{Entity}({Create}Command request) 
        => await PostAsync<{Create}Command, {Response}Dto>("api/{feature}/{entity}", request);

    public async Task<Result<{Response}Dto>> Update{Entity}({Update}Command request) 
        => await PutAsync<{Update}Command, {Response}Dto>("api/{feature}/{entity}", request);

    public async Task<Result<bool>> Delete{Entity}(Guid id) 
        => await DeleteAsync<bool>($"api/{feature}/{entity}/{id}");
}
```

**Rules:**
- Inherit from `HandleResponse` base class
- Constructor takes `HttpClient` and passes to base
- Use base class methods: `GetAsync`, `PostAsync`, `PutAsync`, `DeleteAsync`
- API routes match backend endpoints exactly
- Never instantiate `HttpClient` directly

---

### Step 3: Register Service in DependencyInjection
**Location:** `DependencyInjection.cs`

```csharp
public static IServiceCollection AddClient(this IServiceCollection service, IConfiguration configuration)
{
    service.AddScoped<I{Feature}ApiService, {Feature}ApiService>();
    // ... other services
}

public static IServiceCollection AddPersistence(this IServiceCollection service, IConfiguration configuration)
{
    // Use extension method for API clients that need auth
    service.AddApiHttpClient<I{Feature}ApiService, {Feature}ApiService>(configuration);
    
    return service;
}
```

**Rules:**
- Register interface and implementation as `Scoped`
- Use `AddApiHttpClient` extension for authenticated endpoints
- Use plain `AddHttpClient` for public endpoints (like Auth)
- `AddApiHttpClient` automatically adds `RefreshTokenDelegatingHandler` and `AuthorizationDelegatingHandler`

---

### Step 4: Create Page Component
**Location:** `Components/Pages/{Feature}.razor`

```razor
@page "/{route}"
@rendermode InteractiveServer
@inject I{Feature}ApiService {Feature}Api
@inject NavigationManager Navigation
@inject PersistentComponentState ApplicationState
@using NexApply.Contracts.{Feature}.Commands
@using NexApply.Contracts.{Feature}.Dtos
@using NexApply.Client.Interfaces
@implements IDisposable

<PageTitle>{Feature} — NexApply</PageTitle>

<div class="app-shell">
    <Sidebar />
    
    <main class="main-content">
        <PageHeader Title="{Feature}" Subtitle="Description">
            <!-- Header actions -->
        </PageHeader>

        <div class="{feature}-body">
            @if (IsLoading)
            {
                <!-- Loading state -->
            }
            else if (LoadError != null)
            {
                <!-- Error state -->
            }
            else
            {
                <!-- Content -->
            }
        </div>
    </main>
</div>

@code {
    /* ─── Persistent State ─── */
    private PersistingComponentStateSubscription _persistingSubscription;

    private bool IsLoading = true;
    private string? LoadError = null;
    private List<{Entity}Dto> Items = new();

    protected override async Task OnInitializedAsync()
    {
        // Register state persistence
        _persistingSubscription = ApplicationState.RegisterOnPersisting(PersistState);

        // Try to restore state first
        if (!ApplicationState.TryTakeFromJson<List<{Entity}Dto>>("items", out var restoredItems))
        {
            await LoadData();
        }
        else
        {
            // Restore from persisted state
            Items = restoredItems ?? new();
            IsLoading = false;
        }
    }

    private Task PersistState()
    {
        ApplicationState.PersistAsJson("items", Items);
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _persistingSubscription.Dispose();
    }

    private async Task LoadData()
    {
        IsLoading = true;
        LoadError = null;
        StateHasChanged();

        var result = await {Feature}Api.Get{Entity}();
        if (result.IsSuccess && result.Value != null)
        {
            Items = result.Value;
        }
        else
        {
            LoadError = result.ErrorMessage ?? "Failed to load data";
        }

        IsLoading = false;
        StateHasChanged();
    }

    private async Task HandleCreate()
    {
        var command = new Create{Entity}Command(/* params */);
        var result = await {Feature}Api.Create{Entity}(command);
        
        if (result.IsSuccess)
        {
            await LoadData(); // Refresh
        }
        else
        {
            // Show error
        }
    }
}
```

**Rules:**
- Always use `@rendermode InteractiveServer`
- Inject `PersistentComponentState` for state preservation
- Implement `IDisposable` to clean up subscriptions
- Register `RegisterOnPersisting` in `OnInitializedAsync`
- Try to restore state with `TryTakeFromJson` before loading from API
- Persist state in `PersistState` method
- Dispose subscription in `Dispose` method
- Inject services via `@inject`
- Add `@using` statements for Contracts
- Always have loading and error states
- Call `StateHasChanged()` after async operations
- Use `OnInitializedAsync` for initial data load
- Never expose stack traces to user

---

## HandleResponse Base Class Methods

```csharp
// GET requests
Task<Result<TResponse>> GetAsync<TResponse>(string url)

// POST requests
Task<Result<TResponse>> PostAsync<TRequest, TResponse>(string url, TRequest request)
Task<Result<TResponse>> PostAsync<TResponse>(string url)
Task PostAsync<TRequest>(string url, TRequest request)
Task PostAsync(string url)

// PUT requests
Task<Result<TResponse>> PutAsync<TRequest, TResponse>(string url, TRequest request)

// PATCH requests
Task<Result<TResponse>> UpdateAsync<TRequest, TResponse>(string url, TRequest request)
Task<Result<TResponse>> UpdateAsync<TResponse>(string url)

// DELETE requests
Task<Result<TResponse>> DeleteAsync<TResponse>(string url)
```

**Rules:**
- All methods return `Result<T>` (except void methods)
- Automatically maps HTTP status codes to Result types
- Handles validation errors from 400 responses
- Extracts error messages from JSON responses

---

## HttpClient Configuration

### For Authenticated Endpoints
```csharp
service.AddApiHttpClient<IFeatureApiService, FeatureApiService>(configuration);
```

**Automatically adds:**
- Base address from `appsettings.json` (`ApiBaseUrl`)
- `RefreshTokenDelegatingHandler` (handles 401 and refreshes token)
- `AuthorizationDelegatingHandler` (attaches Bearer token)

### For Public Endpoints (No Auth)
```csharp
service.AddHttpClient<IAuthApiService, AuthApiService>("AuthClient", client =>
{
    client.BaseAddress = new Uri(configuration["ApiBaseUrl"]!);
});
```

---

## Persistent Component State Pattern

### Overview
Blazer Server 10 introduces `PersistentComponentState` to preserve component state across circuit reconnections, preventing data loss and unnecessary API calls during reconnections.

### When to Use
- Pages that load data from API
- Forms with user input
- Components with expensive computations
- Any state that should survive circuit reconnections

### Implementation Pattern

```razor
@inject PersistentComponentState ApplicationState
@implements IDisposable

@code {
    private PersistingComponentStateSubscription _persistingSubscription;
    private List<ItemDto> Items = new();

    protected override async Task OnInitializedAsync()
    {
        // 1. Register persistence callback
        _persistingSubscription = ApplicationState.RegisterOnPersisting(PersistState);

        // 2. Try to restore state first
        if (!ApplicationState.TryTakeFromJson<List<ItemDto>>("items", out var restoredItems))
        {
            // State not found, load from API
            await LoadData();
        }
        else
        {
            // State restored, use cached data
            Items = restoredItems ?? new();
            IsLoading = false;
        }
    }

    private Task PersistState()
    {
        // 3. Persist state before circuit disconnects
        ApplicationState.PersistAsJson("items", Items);
        ApplicationState.PersistAsJson("isEditing", IsEditing);
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        // 4. Clean up subscription
        _persistingSubscription.Dispose();
    }
}
```

### Key Methods

#### RegisterOnPersisting
```csharp
_persistingSubscription = ApplicationState.RegisterOnPersisting(PersistState);
```
Registers a callback that runs before the circuit disconnects.

#### TryTakeFromJson
```csharp
if (!ApplicationState.TryTakeFromJson<T>("key", out var restored))
{
    // State not found, load fresh data
}
else
{
    // State restored, use cached data
}
```
Attempts to restore state from persisted storage.

#### PersistAsJson
```csharp
ApplicationState.PersistAsJson("key", value);
```
Persists state to storage before circuit disconnects.

### Best Practices

#### DO ✅
- Persist only essential data (DTOs, form values, UI state)
- Use unique keys for each persisted value
- Implement `IDisposable` and dispose subscriptions
- Check if state exists before loading from API
- Persist state in a dedicated method
- Use meaningful key names ("profileData", "items", "filters")

#### DON'T ❌
- Don't persist large objects (images, files)
- Don't persist sensitive data (passwords, tokens)
- Don't persist computed values (use properties instead)
- Don't forget to dispose subscriptions
- Don't persist state that changes frequently (use regular state instead)
- Don't use generic keys ("data", "state")

### Example: Profile Page with Persistence

```razor
@inject PersistentComponentState ApplicationState
@implements IDisposable

@code {
    private PersistingComponentStateSubscription _persistingSubscription;
    private string FullName = "";
    private string Email = "";
    private bool IsEditing = false;

    protected override async Task OnInitializedAsync()
    {
        _persistingSubscription = ApplicationState.RegisterOnPersisting(PersistState);

        if (!ApplicationState.TryTakeFromJson<StudentProfileDto>("profileData", out var restored))
        {
            await LoadProfileData();
        }
        else
        {
            FullName = restored?.FullName ?? "";
            Email = restored?.Email ?? "";
            IsLoading = false;
        }

        // Restore UI state
        if (ApplicationState.TryTakeFromJson<bool>("isEditing", out var editState))
        {
            IsEditing = editState;
        }
    }

    private Task PersistState()
    {
        var profileData = new StudentProfileDto
        {
            FullName = FullName,
            Email = Email
        };

        ApplicationState.PersistAsJson("profileData", profileData);
        ApplicationState.PersistAsJson("isEditing", IsEditing);

        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _persistingSubscription.Dispose();
    }
}
```

### Benefits
- **Prevents data loss** during circuit reconnections
- **Reduces API calls** by using cached data
- **Improves UX** by preserving form inputs and UI state
- **Faster page loads** after reconnection
- **Better performance** by avoiding redundant data fetching

---

## Component Patterns

### Loading State
```razor
@if (IsLoading)
{
    <div style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
        <div style="text-align: center; color: #64748B;">
            <svg class="spin-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            <div>Loading...</div>
        </div>
    </div>
}
```

### Error State
```razor
@if (LoadError != null)
{
    <div style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
        <div style="text-align: center; color: #DC2626;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>@LoadError</div>
            <button class="btn-primary" style="margin-top: 16px;" @onclick="LoadData">Retry</button>
        </div>
    </div>
}
```

### Empty State
```razor
@if (!Items.Any())
{
    <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <!-- Icon -->
        </svg>
        <div class="empty-state-title">No items found</div>
        <div class="empty-state-subtitle">Get started by creating your first item</div>
        <button class="btn-primary" @onclick="HandleCreate">Create Item</button>
    </div>
}
```

---

## Result<T> Pattern

### Success Response
```csharp
var result = await ApiService.GetData();
if (result.IsSuccess && result.Value != null)
{
    // Use result.Value
}
```

### Error Handling
```csharp
if (!result.IsSuccess)
{
    // result.ErrorMessage contains user-friendly message
    // result.StatusCode contains HTTP status code
    // result.ValidationErrors contains field-level errors (for 400)
}
```

### Status Code Mapping
- `200 OK` → `Result<T>.Success(value)`
- `204 No Content` → `Result<T>.NoContent()`
- `400 Bad Request` → `Result<T>.ValidationFailure(errors)` or `Result<T>.Failure(message, 400)`
- `401 Unauthorized` → `Result<T>.Unauthorized()`
- `403 Forbidden` → `Result<T>.Forbidden()`
- `404 Not Found` → `Result<T>.NotFound()`
- `409 Conflict` → `Result<T>.Conflict()`
- `500 Internal Server Error` → `Result<T>.Failure(message, 500)`

---

## Authentication Flow

### Token Storage
- Tokens stored in HTTP-only cookies (set by API)
- `AccessToken` read from `HttpContext.User` claims
- `RefreshToken` read from cookie by `RefreshTokenDelegatingHandler`

### Token Attachment
1. `AuthorizationDelegatingHandler` reads `AccessToken` from claims
2. Attaches `Authorization: Bearer {token}` header to request
3. If 401 response, `RefreshTokenDelegatingHandler` intercepts
4. Calls refresh endpoint with `RefreshToken`
5. Updates `TokenService` with new token
6. Retries original request

### Circuit Lifecycle
1. User navigates to page → Circuit connects
2. `TokenCircuitHandler` runs on connection
3. Reads `AccessToken` from `HttpContext.User` claims
4. Stores in `TokenService` (scoped to circuit)
5. Token available for API calls during circuit lifetime
6. Circuit disconnects → Token cleared

---

## Best Practices

### DO ✅
- Always use `Result<T>` pattern for API responses
- Always have loading, error, and empty states
- Use `StateHasChanged()` after async operations
- Inject services via `@inject` directive
- Use `AddApiHttpClient` for authenticated endpoints
- Use `HandleResponse` base class for API services
- Keep business logic in API handlers, not components
- Use DTOs from `NexApply.Contracts` for data transfer
- Show user-friendly error messages
- Add retry buttons for failed operations

### DON'T ❌
- Don't instantiate `HttpClient` directly
- Don't expose stack traces to users
- Don't put business logic in Blazor components
- Don't use `DateTime.Now` (use `DateTime.UtcNow`)
- Don't hardcode API URLs (use `appsettings.json`)
- Don't manually add auth handlers (use `AddApiHttpClient`)
- Don't forget to call `StateHasChanged()` after state changes
- Don't reference `NexApply.Api` from Client (use Contracts only)
- Don't throw exceptions for expected failures (use `Result<T>`)

---

## File Naming Conventions

- **Interfaces:** `I{Feature}ApiService.cs`
- **Implementations:** `{Feature}ApiService.cs`
- **Pages:** `{Feature}.razor` (PascalCase)
- **Components:** `{Component}.razor` (PascalCase)
- **Services folder:** `Services/{Feature}/`
- **One service per feature area**

---

## Example: Complete Feature Implementation

### 1. Interface
```csharp
// Interfaces/IJobApiService.cs
public interface IJobApiService
{
    Task<Result<List<JobListingDto>>> GetJobListings();
    Task<Result<JobListingDto>> GetJobListing(Guid id);
    Task<Result<JobListingDto>> CreateJobListing(CreateJobListingCommand request);
}
```

### 2. Implementation
```csharp
// Services/Job/JobApiService.cs
public class JobApiService : HandleResponse, IJobApiService
{
    public JobApiService(HttpClient http) : base(http) { }

    public async Task<Result<List<JobListingDto>>> GetJobListings() 
        => await GetAsync<List<JobListingDto>>("api/jobs");

    public async Task<Result<JobListingDto>> GetJobListing(Guid id) 
        => await GetAsync<JobListingDto>($"api/jobs/{id}");

    public async Task<Result<JobListingDto>> CreateJobListing(CreateJobListingCommand request) 
        => await PostAsync<CreateJobListingCommand, JobListingDto>("api/jobs", request);
}
```

### 3. Registration
```csharp
// DependencyInjection.cs
service.AddScoped<IJobApiService, JobApiService>();
service.AddApiHttpClient<IJobApiService, JobApiService>(configuration);
```

### 4. Page
```razor
@page "/jobs"
@inject IJobApiService JobApi

<PageTitle>Jobs — NexApply</PageTitle>

@code {
    private List<JobListingDto> Jobs = new();
    
    protected override async Task OnInitializedAsync()
    {
        var result = await JobApi.GetJobListings();
        if (result.IsSuccess && result.Value != null)
        {
            Jobs = result.Value;
        }
    }
}
```

---

## Summary

1. **Create Interface** in `Interfaces/`
2. **Create Implementation** in `Services/{Feature}/`
3. **Register in DI** using `AddApiHttpClient`
4. **Create Page** in `Components/Pages/`
5. **Inject Service** and use `Result<T>` pattern
6. **Handle States** (loading, error, empty, success)

Follow this pattern for every new feature to maintain consistency across the codebase! 🚀
