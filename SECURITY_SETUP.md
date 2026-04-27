# 🔐 Security Setup Required

## ⚠️ IMPORTANT: Environment Variables Setup

This project uses environment variables to protect sensitive credentials. Before running the application, you must configure your local environment.

### Quick Setup (5 minutes)

1. **Navigate to API directory:**
   ```bash
   cd NexApply.Api
   ```

2. **Copy the example file:**
   ```bash
   copy .env.example .env
   ```

3. **Edit `.env` with your credentials:**
   - Database password
   - JWT secret key (generate a random 64-character string)
   - Google OAuth credentials (see documentation)
   - Gmail SMTP credentials (see documentation)

4. **Run the application:**
   ```bash
   dotnet run
   ```

### 📖 Full Documentation

See detailed setup instructions: [`NexApply.Api/Documentation/ENVIRONMENT_SETUP.md`](NexApply.Api/Documentation/ENVIRONMENT_SETUP.md)

---

## What Changed?

- ✅ Secrets moved from `appsettings.Development.json` to `.env` file
- ✅ `.env` file is gitignored (never committed)
- ✅ `.env.example` provides a template with placeholder values
- ✅ Application automatically loads `.env` on startup

## Why?

GitHub blocked your push because `appsettings.Development.json` contained:
- Google OAuth Client ID and Secret
- Database credentials
- JWT tokens
- Email passwords

These are now safely stored in `.env` which is never committed to Git.

---

## Need Help?

- **Environment Setup:** `NexApply.Api/Documentation/ENVIRONMENT_SETUP.md`
- **Google OAuth:** `NexApply.Api/Documentation/GOOGLE_OAUTH_AND_PASSWORD_RESET.md`
- **Email Setup:** `NexApply.Api/Documentation/EMAIL_SETUP.md`
