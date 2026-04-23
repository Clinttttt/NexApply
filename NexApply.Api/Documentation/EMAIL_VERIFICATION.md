# Email Verification Flow

## Overview
NexApply now requires email verification before users can log in. This ensures only valid email addresses are registered.

## Registration Flow

### 1. User Registers
**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "role": "Student"
}
```

**Response:**
```json
{
  "accessToken": null,
  "refreshToken": null
}
```

**What happens:**
- User account is created with `IsEmailVerified = false`
- 6-digit verification code is generated (expires in 10 minutes)
- Verification code is sent to user's email
- User cannot log in until email is verified

### 2. User Verifies Email
**Endpoint:** `POST /api/auth/verify-email`

**Request:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here"
}
```

**What happens:**
- Code is validated (must match and not be expired)
- User's `IsEmailVerified` is set to `true`
- Verification code is cleared
- JWT tokens are returned
- User can now log in

### 3. Resend Verification Code (Optional)
**Endpoint:** `POST /api/auth/send-verification-code`

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
"Verification code sent to your email."
```

**What happens:**
- New 6-digit code is generated
- Old code is replaced
- New code is sent to email

## Login Flow

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (if email not verified):**
```json
{
  "isSuccess": false,
  "error": "Email not verified. Please verify your email before logging in."
}
```
Status: `401 Unauthorized`

**Response (if email verified):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here"
}
```
Status: `200 OK`

## Database Schema

### User Entity
```csharp
public class User : BaseEntity
{
    // ... existing fields
    public bool IsEmailVerified { get; private set; } = false;
    public string? EmailVerificationCode { get; private set; }
    public DateTime? EmailVerificationCodeExpiry { get; private set; }
}
```

## Email Template

The verification email includes:
- NexApply branding
- 6-digit code displayed prominently
- Expiration notice (10 minutes)
- Security notice

## Error Handling

| Error | Status | Message |
|-------|--------|---------|
| Email not found | 404 | "Email not found." |
| Already verified | 409 | "Email is already verified." |
| Code expired | 400 | "Verification code has expired. Please request a new code." |
| Invalid code | 400 | "Invalid verification code." |
| Email not verified (login) | 401 | "Email not verified. Please verify your email before logging in." |

## Security Features

1. **Code Expiration:** Codes expire after 10 minutes
2. **6-Digit Codes:** Random numeric codes (100000-999999)
3. **One-Time Use:** Code is cleared after successful verification
4. **Login Block:** Users cannot log in until email is verified
5. **Code Replacement:** Requesting new code invalidates old one

## Testing

### Manual Testing Flow
1. Register a new user
2. Check email for verification code
3. Verify email with code
4. Try logging in (should succeed)
5. Try logging in with unverified account (should fail)

### Test Accounts
For testing, you can:
1. Use a real email service (Gmail, Outlook, etc.)
2. Check SMTP logs for verification codes
3. Temporarily disable email verification check in LoginHandler for development

## Configuration

Email settings are in `appsettings.json`:
```json
{
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "SmtpUsername": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "FromEmail": "your-email@gmail.com",
    "FromName": "NexApply"
  }
}
```

See `EMAIL_SETUP.md` for detailed email configuration instructions.
