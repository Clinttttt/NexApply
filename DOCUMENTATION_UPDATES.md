# Documentation Updates - Contracts Layer

## Files Updated

### 1. `.amazonq/rules/agent.md`
✅ Added **Project Structure** section showing all 4 projects  
✅ Updated **Architecture Rules** to mention Commands/Queries in Contracts  
✅ Updated **Slice Structure** to show separation between Contracts and Api  
✅ Updated **Key Patterns** with Contracts namespace examples  
✅ Updated **Enums** section to clarify UserRole is in Contracts  
✅ Updated **Prompt Template** to include Contracts layer workflow  

### 2. `.amazonq/rules/project-rule.md`
✅ Updated **Architecture** section to include Contracts Layer  
✅ Added **Project Layers** section explaining each layer's responsibility  
✅ Updated **Slice Structure** with Contracts and Api examples  
✅ Updated **Result Pattern** with Contracts namespace example  
✅ Updated **Naming Conventions** to include Commands/Queries/DTOs in Contracts  
✅ Updated **Don't Reinvent the Wheel** with Contracts layer rules  

---

## Key Changes

### Before (Old Pattern)
```
NexApply.Api/Features/Auth/Login/
├── LoginHandler.cs     ← Command + Handler in one file
├── LoginEndpoint.cs
└── LoginValidator.cs
```

### After (New Pattern with Contracts)
```
NexApply.Contracts/Auth/
├── LoginCommand.cs          ← Command only
└── TokenResponseDto.cs      ← DTO

NexApply.Api/Features/Auth/Login/
├── LoginHandler.cs          ← Handler only
├── LoginEndpoint.cs
└── LoginValidator.cs
```

---

## New Rules

1. **Commands/Queries** → `NexApply.Contracts`
2. **DTOs** → `NexApply.Contracts`
3. **Handlers/Validators/Endpoints** → `NexApply.Api`
4. **Client references Contracts, NOT Api**
5. **Shared enums** (like `UserRole`) → `NexApply.Contracts.Enums`
6. **Domain-specific enums** → `NexApply.Api.Entities.Enums`

---

## Import Pattern

### In Contracts
```csharp
using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.Auth;

public record LoginCommand(string Username, string Password) 
    : IRequest<Result<TokenResponseDto>>;
```

### In Api Handler
```csharp
using MediatR;
using NexApply.Contracts.Common;
using NexApply.Contracts.Auth;
using NexApply.Api.Data;

namespace NexApply.Api.Features.Auth.Login;

public class LoginHandler(AppDbContext context) 
    : IRequestHandler<LoginCommand, Result<TokenResponseDto>>
{
    // Implementation
}
```

### In Api Endpoint
```csharp
using MediatR;
using NexApply.Contracts.Auth;
using NexApply.Api.Common;

namespace NexApply.Api.Features.Auth.Login;

public static class LoginEndpoint
{
    public static void MapLoginEndpoint(this WebApplication app)
    {
        app.MapPost("/api/auth/login", async (LoginCommand request, ISender mediator) =>
        {
            var result = await mediator.Send(request);
            return ResultExtensions.ToIResult(result);
        });
    }
}
```

### In Client Service
```csharp
using NexApply.Contracts.Common;
using NexApply.Contracts.Auth;

namespace NexApply.Client.Services.Auth;

public class AuthApiService
{
    public async Task<Result<TokenResponseDto>> Login(LoginCommand request)
        => await PostAsync<LoginCommand, TokenResponseDto>("api/auth/login", request);
}
```

---

## Benefits

✅ **Clean separation** — Client doesn't depend on Api internals  
✅ **No EF Core in Client** — Blazor stays lightweight  
✅ **Single source of truth** — Contracts define the API contract  
✅ **Type safety** — Shared types between Client and Api  
✅ **Easier refactoring** — Changes to contracts are explicit  
✅ **Better testability** — Can test contracts independently  

---

All documentation is now up-to-date with the Contracts layer architecture! 🎉
