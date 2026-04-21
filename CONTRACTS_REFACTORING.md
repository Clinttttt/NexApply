# Contracts Layer Refactoring - Complete ✅

## Problem
The **NexApply.Client** project was directly referencing **NexApply.Api**, which:
- Brought in unnecessary EF Core dependencies (Microsoft.EntityFrameworkCore, Npgsql)
- Violated separation of concerns
- Created tight coupling between frontend and backend
- Caused assembly loading errors

## Solution
Created a **NexApply.Contracts** layer to hold shared contracts between Client and API.

---

## Architecture

```
┌─────────────────────┐
│  NexApply.Client    │
│  (Blazor Server)    │
└──────────┬──────────┘
           │ references
           ▼
┌─────────────────────┐
│ NexApply.Contracts  │  ◄─── Shared layer (DTOs, Commands, Result<T>)
│  (Class Library)    │
└──────────┬──────────┘
           ▲
           │ references
┌──────────┴──────────┐
│   NexApply.Api      │
│  (.NET 9 Web API)   │
└─────────────────────┘
```

---

## What's in NexApply.Contracts

### 1. **Common/**
- `Result<T>` — unified response wrapper for all operations

### 2. **Auth/**
- `TokenResponseDto` — access + refresh tokens
- `LoginCommand` — username/password login
- `LoginWithEmailCommand` — Google OAuth login
- `RefreshTokenCommand` — refresh token
- `SwitchRoleCommand` — switch between Student/Company roles

### 3. **Enums/**
- `UserRole` — Student, Company

---

## Changes Made

### NexApply.Contracts (NEW)
✅ Created new class library project  
✅ Added `MediatR.Contracts` package (for `IRequest<T>`)  
✅ Moved `Result<T>` from API  
✅ Moved `TokenResponseDto` from API  
✅ Moved `UserRole` enum from API  
✅ Created all Command records (Login, LoginWithEmail, RefreshToken, SwitchRole)

### NexApply.Api
✅ Added reference to `NexApply.Contracts`  
✅ Removed duplicate `Result<T>` class  
✅ Removed duplicate `TokenResponseDto` class  
✅ Updated all handlers to use Contracts commands  
✅ Updated all validators to use Contracts commands  
✅ Updated all endpoints to use Contracts commands  
✅ Updated `TokenService` to return `Contracts.Auth.TokenResponseDto`  
✅ Updated `ResultExtensions` to use `Contracts.Common.Result<T>`

### NexApply.Client
✅ Removed reference to `NexApply.Api`  
✅ Added reference to `NexApply.Contracts`  
✅ Removed EF Core packages (`Microsoft.EntityFrameworkCore`, `Npgsql.EntityFrameworkCore.PostgreSQL`)  
✅ Updated `IAuthApiService` to use Contracts  
✅ Updated `AuthApiService` to use Contracts  
✅ Updated `HandleResponse` to use Contracts  
✅ Updated `AuthProxyController` to use Contracts  
✅ Removed unused `Npgsql` reference from `AuthService`  
✅ Removed unused API reference from `DependencyInjection`

---

## Benefits

✅ **Clean separation** — Client no longer depends on API internals  
✅ **No EF Core in Client** — Blazor project stays lightweight  
✅ **Shared contracts** — Single source of truth for DTOs and commands  
✅ **Easier testing** — Can mock contracts without API dependencies  
✅ **Better maintainability** — Changes to contracts are explicit and visible  
✅ **Follows best practices** — Vertical Slice Architecture with shared contracts layer

---

## Project Dependencies

```
NexApply.Client (net10.0)
├── NexApply.Contracts (net9.0)
└── System.IdentityModel.Tokens.Jwt

NexApply.Api (net9.0)
├── NexApply.Contracts (net9.0)
├── MediatR
├── FluentValidation
├── Microsoft.EntityFrameworkCore
├── Npgsql.EntityFrameworkCore.PostgreSQL
└── Microsoft.AspNetCore.Authentication.JwtBearer

NexApply.Contracts (net9.0)
└── MediatR.Contracts
```

---

## How to Add New Features

### Example: Add a new "Register" command

1. **Create command in Contracts:**
```csharp
// NexApply.Contracts/Auth/RegisterCommand.cs
using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Auth;

public record RegisterCommand(
    string Email,
    string Username,
    string Password,
    UserRole Role
) : IRequest<Result<TokenResponseDto>>;
```

2. **Create handler in API:**
```csharp
// NexApply.Api/Features/Auth/Register/RegisterHandler.cs
using MediatR;
using NexApply.Contracts.Common;
using NexApply.Contracts.Auth;
using NexApply.Api.Data;

namespace NexApply.Api.Features.Auth.Register;

public class RegisterHandler(AppDbContext context, TokenService tokenService)
    : IRequestHandler<RegisterCommand, Result<TokenResponseDto>>
{
    public async Task<Result<TokenResponseDto>> Handle(
        RegisterCommand request,
        CancellationToken cancellationToken)
    {
        // Implementation here
    }
}
```

3. **Create validator in API:**
```csharp
// NexApply.Api/Features/Auth/Register/RegisterValidator.cs
using FluentValidation;
using NexApply.Contracts.Auth;

namespace NexApply.Api.Features.Auth.Register;

public class RegisterValidator : AbstractValidator<RegisterCommand>
{
    public RegisterValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Username).NotEmpty().MinimumLength(3);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
    }
}
```

4. **Create endpoint in API:**
```csharp
// NexApply.Api/Features/Auth/Register/RegisterEndpoint.cs
using MediatR;
using NexApply.Contracts.Auth;
using NexApply.Api.Common;

namespace NexApply.Api.Features.Auth.Register;

public static class RegisterEndpoint
{
    public static void MapRegisterEndpoint(this WebApplication app)
    {
        app.MapPost("/api/auth/register", async (RegisterCommand request, ISender mediator) =>
        {
            var result = await mediator.Send(request);
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Auth");
    }
}
```

5. **Use in Client:**
```csharp
// NexApply.Client/Services/Auth/AuthApiService.cs
public async Task<Result<TokenResponseDto>> Register(RegisterCommand request)
    => await PostAsync<RegisterCommand, TokenResponseDto>("api/auth/register", request);
```

---

## Testing

All projects build successfully:
- ✅ NexApply.Contracts
- ✅ NexApply.Api
- ✅ NexApply.Client

No assembly loading errors. Clean architecture maintained.
