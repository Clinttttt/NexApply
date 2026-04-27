# ForgotPassword & ResetPassword Features - Implementation Summary

## Feature: Auth
**Slices:** ForgotPassword, ResetPassword  
**Entity:** User  
**Authorization:** Anonymous (no authentication required)

---

## Files Created/Modified

### 1. NexApply.Contracts/Auth/
- **ForgotPasswordCommand.cs** - Command with Email
- **ResetPasswordCommand.cs** - Command with Email, ResetCode, NewPassword, ConfirmPassword

### 2. NexApply.Api/Features/Auth/ForgotPassword/
- **ForgotPasswordHandler.cs** - Handler that:
  - Finds user by email
  - Generates 6-digit reset code
  - Sets code with 15-minute expiry
  - Sends code via email
- **ForgotPasswordValidator.cs** - Validates email format
- **ForgotPasswordEndpoint.cs** - POST /api/auth/forgot-password endpoint

### 3. NexApply.Api/Features/Auth/ResetPassword/
- **ResetPasswordHandler.cs** - Handler that:
  - Finds user by email
  - Validates reset code and expiry
  - Hashes new password
  - Resets password and clears code
- **ResetPasswordValidator.cs** - Validates email, code (6 digits), password (min 6 chars), confirm password
- **ResetPasswordEndpoint.cs** - POST /api/auth/reset-password endpoint

### 4. Modified Files
- **NexApply.Api/Entities/User.cs** - Added:
  - `PasswordResetCode` property
  - `PasswordResetCodeExpiry` property
  - `SetPasswordResetCode(code, expiry)` domain method
  - `ResetPassword(newPasswordHash)` domain method
- **NexApply.Api/Data/AppDbContext.cs** - Added PasswordResetCode configuration
- **NexApply.Api/Features/Auth/AuthEndpoints.cs** - Registered both endpoints
- **NexApply.Api/Services/SmtpEmailService.cs** - Already has `SendPasswordResetCodeAsync` method
- **Migration:** AddPasswordResetFields - Added PasswordResetCode and PasswordResetCodeExpiry columns

---

## API Endpoints

### POST /api/auth/forgot-password
**Authorization:** Anonymous (no token required)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
"Password reset code sent to your email"
```

**Error Responses:**
- **404 Not Found:** Email not found
- **400 Bad Request:** Invalid email format

---

### POST /api/auth/reset-password
**Authorization:** Anonymous (no token required)

**Request Body:**
```json
{
  "email": "user@example.com",
  "resetCode": "123456",
  "newPassword": "NewPass123",
  "confirmPassword": "NewPass123"
}
```

**Response (200 OK):**
```json
"Password reset successfully. You can now login with your new password"
```

**Error Responses:**
- **404 Not Found:** Email not found
- **400 Bad Request:** 
  - No password reset request found
  - Reset code has expired
  - Invalid reset code
  - Passwords do not match
  - Password too short

---

## Validation Rules

### ForgotPassword
- **Email:** Required, valid email format

### ResetPassword
- **Email:** Required, valid email format
- **ResetCode:** Required, exactly 6 digits
- **NewPassword:** Required, minimum 6 characters
- **ConfirmPassword:** Required, must match NewPassword

---

## Security Features

✅ Reset code expires after 15 minutes  
✅ 6-digit random code (100000-999999)  
✅ Code is cleared after successful reset  
✅ Validates code before allowing reset  
✅ Uses PasswordHasher for secure hashing  
✅ No authentication required (public endpoints)  
✅ Email sent asynchronously (fire-and-forget)  

---

## Email Template

The system sends a professional HTML email with:
- NexApply branding
- Large, centered 6-digit code
- 15-minute expiry notice
- Security warning if not requested
- Responsive design

---

## Database Schema

### Users Table (New Columns)
- `PasswordResetCode` varchar(10) nullable
- `PasswordResetCodeExpiry` timestamp nullable

---

## Architecture Compliance

✅ Vertical Slice Architecture - Two self-contained slices  
✅ DDD - Uses User.SetPasswordResetCode and User.ResetPassword domain methods  
✅ Contracts Layer - Commands in shared layer  
✅ Result<T> Pattern - Handlers return Result<string>  
✅ FluentValidation - Validators auto-discovered  
✅ MediatR - Command/Handler pattern  
✅ Authorization - Anonymous (public endpoints)  
✅ AppDbContext - Direct injection into handlers  
✅ IEmailService - Async email sending  
✅ Migration Applied - Database schema updated  

---

## Usage Flow

### Forgot Password Flow
1. User clicks "Forgot Password" on login page
2. Enters email address
3. Submits form
4. API generates 6-digit code
5. API sends code to email
6. User receives email with code
7. User enters code on reset password page

### Reset Password Flow
1. User enters email, reset code, new password, confirm password
2. Submits form
3. API validates code and expiry
4. API hashes and saves new password
5. API clears reset code
6. User receives success message
7. User can now login with new password

---

## Testing

Test with Swagger UI or Postman:

### Forgot Password
1. POST to /api/auth/forgot-password with email
2. Verify 200 OK response
3. Check email inbox for 6-digit code
4. Verify 404 Not Found with non-existent email

### Reset Password
1. POST to /api/auth/reset-password with email, code, new password
2. Verify 200 OK response
3. Try logging in with new password
4. Verify 400 Bad Request with:
   - Wrong code
   - Expired code (wait 15 minutes)
   - Mismatched passwords
   - Short password

---

## Next Steps

To use these endpoints in Blazor Client:
1. Add ForgotPassword and ResetPassword methods to IAuthApiService
2. Implement in AuthApiService
3. Create Forgot Password page component
4. Create Reset Password page component
5. Add navigation from Login page to Forgot Password
6. Show success/error messages to user
