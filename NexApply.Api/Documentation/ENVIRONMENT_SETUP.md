# Environment Variables Setup

## Overview
NexApply API uses environment variables to store sensitive configuration like database credentials, JWT secrets, OAuth keys, and email settings. This prevents secrets from being committed to Git.

---

## Quick Start

### 1. Create `.env` file
Copy the example file and fill in your actual values:

```bash
cd NexApply.Api
copy .env.example .env
```

### 2. Edit `.env` with your secrets
Open `.env` and replace all placeholder values with your actual credentials.

### 3. Run the application
The `.env` file is automatically loaded on startup. Never commit this file to Git!

---

## Configuration Details

### Database Configuration
```env
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=NextApplyDb;Username=postgres;Password=YOUR_PASSWORD
```

**How to get:**
- Install PostgreSQL locally
- Create database: `CREATE DATABASE NextApplyDb;`
- Use your PostgreSQL username and password

---

### JWT Configuration
```env
AppSettings__Token=YOUR_SUPER_SECURE_JWT_SECRET_KEY_AT_LEAST_32_CHARACTERS_LONG
AppSettings__Issuer=NexApply
AppSettings__Audience=NexApplyUsers
```

**How to generate a secure token:**
```bash
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Or use online generator: https://randomkeygen.com/
```

**Requirements:**
- Token must be at least 32 characters long
- Use random alphanumeric characters
- Never reuse tokens across environments

---

### Google OAuth Configuration
```env
Authentication__Google__ClientId=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
Authentication__Google__ClientSecret=YOUR_GOOGLE_CLIENT_SECRET
```

**How to get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `https://localhost:7001/api/auth/google-callback` (Development)
   - `https://yourdomain.com/api/auth/google-callback` (Production)
7. Copy **Client ID** and **Client Secret**

**See also:** `Documentation/GOOGLE_OAUTH_AND_PASSWORD_RESET.md`

---

### Email Configuration (Gmail SMTP)
```env
EmailSettings__SmtpHost=smtp.gmail.com
EmailSettings__SmtpPort=587
EmailSettings__SmtpUsername=your-email@gmail.com
EmailSettings__SmtpPassword=your-app-specific-password
EmailSettings__FromEmail=your-email@gmail.com
EmailSettings__FromName=NexApply
```

**How to get Gmail App Password:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (required)
3. Go to **App passwords**
4. Select app: **Mail**
5. Select device: **Other (Custom name)** → Enter "NexApply"
6. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
7. Use this password in `EmailSettings__SmtpPassword`

**See also:** `Documentation/EMAIL_SETUP.md`

---

## Environment Variable Naming Convention

.NET uses double underscores (`__`) to represent nested JSON structure:

```env
# This environment variable:
AppSettings__Token=secret123

# Maps to this JSON:
{
  "AppSettings": {
    "Token": "secret123"
  }
}
```

---

## Security Best Practices

### ✅ DO
- Keep `.env` file in `.gitignore` (already configured)
- Use different secrets for Development, Staging, and Production
- Rotate secrets regularly (every 90 days)
- Use strong, randomly generated secrets
- Store production secrets in secure vaults (Azure Key Vault, AWS Secrets Manager)
- Share secrets securely (1Password, LastPass, encrypted channels)

### ❌ DON'T
- Never commit `.env` file to Git
- Never hardcode secrets in `appsettings.json` or `appsettings.Development.json`
- Never share secrets in plain text (Slack, email, Discord)
- Never reuse secrets across environments
- Never commit `appsettings.Development.json` with real secrets

---

## Production Deployment

For production, use environment variables from your hosting platform:

### Azure App Service
1. Go to **Configuration** → **Application settings**
2. Add each variable as a new setting:
   - Name: `ConnectionStrings__DefaultConnection`
   - Value: `Host=...`

### Docker
```bash
docker run -e ConnectionStrings__DefaultConnection="Host=..." \
           -e AppSettings__Token="..." \
           nexapply-api
```

### Docker Compose
```yaml
services:
  api:
    image: nexapply-api
    environment:
      - ConnectionStrings__DefaultConnection=Host=...
      - AppSettings__Token=...
```

---

## Troubleshooting

### "Configuration value not found"
- Ensure `.env` file exists in `NexApply.Api/` directory
- Check variable names use double underscores (`__`)
- Restart the application after editing `.env`

### "Invalid JWT token"
- Ensure `AppSettings__Token` is at least 32 characters
- Check token doesn't contain special characters that need escaping

### "Google OAuth error"
- Verify redirect URI matches exactly in Google Console
- Check ClientId and ClientSecret are correct
- Ensure Google+ API is enabled

### "Email sending failed"
- Verify 2-Step Verification is enabled on Gmail
- Use App Password, not your regular Gmail password
- Check SMTP port is 587 (not 465 or 25)

---

## Example `.env` File

```env
# Database
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=NextApplyDb;Username=postgres;Password=MySecurePassword123

# JWT
AppSettings__Token=aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9nO1pQ3rS5t
AppSettings__Issuer=NexApply
AppSettings__Audience=NexApplyUsers

# Google OAuth
Authentication__Google__ClientId=123456789-abcdefghijklmnop.apps.googleusercontent.com
Authentication__Google__ClientSecret=GOCSPX-AbCdEfGhIjKlMnOpQrStUvWx

# Email (Gmail)
EmailSettings__SmtpHost=smtp.gmail.com
EmailSettings__SmtpPort=587
EmailSettings__SmtpUsername=myapp@gmail.com
EmailSettings__SmtpPassword=abcd efgh ijkl mnop
EmailSettings__FromEmail=myapp@gmail.com
EmailSettings__FromName=NexApply
```

---

## Need Help?

- **Google OAuth Setup:** See `Documentation/GOOGLE_OAUTH_AND_PASSWORD_RESET.md`
- **Email Setup:** See `Documentation/EMAIL_SETUP.md`
- **General Questions:** Check project documentation in `Documentation/` folder
