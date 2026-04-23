# Google OAuth & Password Reset Setup

## Google OAuth Integration

### Prerequisites
1. Google Cloud Console project
2. OAuth 2.0 Client ID credentials
3. Authorized redirect URIs configured

### Backend Setup (API)

#### 1. Install NuGet Packages
```bash
dotnet add package Microsoft.AspNetCore.Authentication.Google
```

#### 2. Configure in Program.cs
```csharp
builder.Services.AddAuthentication()
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;
        options.CallbackPath = "/api/auth/google-callback";
        options.SaveTokens = true;
    });
```

#### 3. Add to appsettings.json
```json
{
  "Authentication": {
    "Google": {
      "ClientId": "YOUR_GOOGLE_CLIENT_ID",
      "ClientSecret": "YOUR_GOOGLE_CLIENT_SECRET"
    }
  }
}
```

#### 4. Create Google Login Endpoint
```csharp
// NexApply.Api/Features/Auth/GoogleLogin/GoogleLoginEndpoint.cs
public static class GoogleLoginEndpoint
{
    public static void MapGoogleLoginEndpoint(this WebApplication app)
    {
        app.MapGet("/api/auth/google-login", (HttpContext context) =>
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = "/api/auth/google-callback"
            };
            return Results.Challenge(properties, new[] { "Google" });
        });

        app.MapGet("/api/auth/google-callback", async (HttpContext context, AppDbContext db, TokenService tokenService) =>
        {
            var result = await context.AuthenticateAsync("Google");
            if (!result.Succeeded)
                return Results.Redirect("/login?error=google_auth_failed");

            var email = result.Principal?.FindFirst(ClaimTypes.Email)?.Value;
            var name = result.Principal?.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(email))
                return Results.Redirect("/login?error=no_email");

            // Check if user exists
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                // Create new user
                var passwordHasher = new PasswordHasher<User>();
                var randomPassword = Guid.NewGuid().ToString();
                var passwordHash = passwordHasher.HashPassword(null!, randomPassword);

                user = User.CreateStudent(email, email.Split('@')[0], passwordHash);
                user.VerifyEmail(); // Auto-verify Google users
                db.Users.Add(user);

                var studentProfile = StudentProfile.Create(user.Id, name ?? email);
                db.StudentProfiles.Add(studentProfile);

                await db.SaveChangesAsync();
            }

            // Generate tokens
            var tokens = await tokenService.CreateTokenResponse(user);

            // Set cookies
            context.Response.Cookies.Append("AccessToken", tokens.AccessToken!, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });

            return Results.Redirect("/menu");
        });
    }
}
```

### Frontend Setup (Client)

The Google OAuth button is already wired up:
```csharp
private void SignInWithGoogle()
{
    Navigation.NavigateTo("/api/auth/google-login", forceLoad: true);
}
```

### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add Authorized redirect URIs:
   - `https://localhost:7000/api/auth/google-callback` (dev)
   - `https://yourdomain.com/api/auth/google-callback` (prod)
7. Copy Client ID and Client Secret to appsettings.json

---

## Password Reset Flow

### Backend Implementation

#### 1. Add Password Reset Fields to User Entity
```csharp
public class User : BaseEntity
{
    // ... existing fields
    public string? PasswordResetCode { get; private set; }
    public DateTime? PasswordResetCodeExpiry { get; private set; }

    public void SetPasswordResetCode(string code, DateTime expiry)
    {
        PasswordResetCode = code;
        PasswordResetCodeExpiry = expiry;
        MarkAsUpdated();
    }

    public void ResetPassword(string newPasswordHash)
    {
        PasswordHash = newPasswordHash;
        PasswordResetCode = null;
        PasswordResetCodeExpiry = null;
        MarkAsUpdated();
    }
}
```

#### 2. Create Commands in Contracts
```csharp
// NexApply.Contracts/Auth/SendPasswordResetCodeCommand.cs
public record SendPasswordResetCodeCommand(string Email) : IRequest<Result<string>>;

// NexApply.Contracts/Auth/ResetPasswordCommand.cs
public record ResetPasswordCommand(
    string Email,
    string Code,
    string NewPassword,
    string ConfirmPassword
) : IRequest<Result<string>>;
```

#### 3. Create Handlers
```csharp
// NexApply.Api/Features/Auth/SendPasswordResetCode/SendPasswordResetCodeHandler.cs
public class SendPasswordResetCodeHandler : IRequestHandler<SendPasswordResetCodeCommand, Result<string>>
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;

    public async Task<Result<string>> Handle(SendPasswordResetCodeCommand request, CancellationToken ct)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email, ct);
        if (user is null)
            return Result<string>.NotFound("Email not found.");

        var code = Random.Shared.Next(100000, 999999).ToString();
        var expiry = DateTime.UtcNow.AddMinutes(10);

        user.SetPasswordResetCode(code, expiry);
        await _context.SaveChangesAsync(ct);

        _ = _emailService.SendPasswordResetCodeAsync(request.Email, code);

        return Result<string>.Success("Reset code sent to your email.");
    }
}

// NexApply.Api/Features/Auth/ResetPassword/ResetPasswordHandler.cs
public class ResetPasswordHandler : IRequestHandler<ResetPasswordCommand, Result<string>>
{
    private readonly AppDbContext _context;

    public async Task<Result<string>> Handle(ResetPasswordCommand request, CancellationToken ct)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email, ct);
        if (user is null)
            return Result<string>.NotFound("Email not found.");

        if (string.IsNullOrEmpty(user.PasswordResetCode))
            return Result<string>.Failure("No reset code found. Please request a new code.");

        if (user.PasswordResetCodeExpiry < DateTime.UtcNow)
            return Result<string>.Failure("Reset code has expired. Please request a new code.");

        if (user.PasswordResetCode != request.Code)
            return Result<string>.Failure("Invalid reset code.");

        if (request.NewPassword != request.ConfirmPassword)
            return Result<string>.Failure("Passwords do not match.");

        var passwordHasher = new PasswordHasher<User>();
        var newPasswordHash = passwordHasher.HashPassword(user, request.NewPassword);

        user.ResetPassword(newPasswordHash);
        await _context.SaveChangesAsync(ct);

        return Result<string>.Success("Password reset successfully.");
    }
}
```

#### 4. Create Endpoints
```csharp
// NexApply.Api/Features/Auth/SendPasswordResetCode/SendPasswordResetCodeEndpoint.cs
public static class SendPasswordResetCodeEndpoint
{
    public static void MapSendPasswordResetCodeEndpoint(this WebApplication app)
    {
        app.MapPost("/api/auth/send-password-reset-code", async (SendPasswordResetCodeCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Auth")
        .AllowAnonymous();
    }
}

// NexApply.Api/Features/Auth/ResetPassword/ResetPasswordEndpoint.cs
public static class ResetPasswordEndpoint
{
    public static void MapResetPasswordEndpoint(this WebApplication app)
    {
        app.MapPost("/api/auth/reset-password", async (ResetPasswordCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return ResultExtensions.ToIResult(result);
        })
        .WithTags("Auth")
        .AllowAnonymous();
    }
}
```

#### 5. Register Endpoints in AuthEndpoints.cs
```csharp
public static void MapAuthEndpoints(this WebApplication app)
{
    // ... existing endpoints
    app.MapSendPasswordResetCodeEndpoint();
    app.MapResetPasswordEndpoint();
    app.MapGoogleLoginEndpoint();
}
```

#### 6. Add to AuthProxyController
```csharp
[HttpPost("send-password-reset-code")]
public async Task<IActionResult> SendPasswordResetCode([FromBody] SendPasswordResetCodeCommand command)
{
    var result = await authApiService.SendPasswordResetCode(command);
    if (!result.IsSuccess)
        return BadRequest(new { error = result.Error });
    return Ok(new { message = result.Value });
}

[HttpPost("reset-password")]
public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
{
    var result = await authApiService.ResetPassword(command);
    if (!result.IsSuccess)
        return BadRequest(new { error = result.Error });
    return Ok(new { message = result.Value });
}
```

### Frontend Implementation

The Forgot Password page is already created at `/forgot-password`. Wire it up in AuthService:

```csharp
public async Task<bool> SendPasswordResetCode(string email)
{
    try
    {
        var data = new { email };
        var json = JsonSerializer.Serialize(data);
        return await js.InvokeAsync<bool>("sendRequest", "/api/authproxy/send-password-reset-code", json);
    }
    catch { return false; }
}

public async Task<bool> ResetPassword(string email, string code, string newPassword, string confirmPassword)
{
    try
    {
        var data = new { email, code, newPassword, confirmPassword };
        var json = JsonSerializer.Serialize(data);
        return await js.InvokeAsync<bool>("sendRequest", "/api/authproxy/reset-password", json);
    }
    catch { return false; }
}
```

### Database Migration

Run migration to add password reset fields:
```bash
dotnet ef migrations add AddPasswordResetFields
dotnet ef database update
```

---

## Testing

### Google OAuth
1. Configure Google Cloud Console
2. Add credentials to appsettings.json
3. Click "Continue with Google" button
4. Authorize with Google account
5. Should redirect to dashboard

### Password Reset
1. Go to `/forgot-password`
2. Enter email address
3. Check email for 6-digit code
4. Enter code and new password
5. Should redirect to login
6. Login with new password

---

## Security Notes

- ✅ Reset codes expire after 10 minutes
- ✅ Codes are single-use (cleared after reset)
- ✅ Google users are auto-verified
- ✅ Passwords are hashed with ASP.NET Identity PasswordHasher
- ✅ HTTPS required for production
- ✅ HTTP-only cookies for token storage
