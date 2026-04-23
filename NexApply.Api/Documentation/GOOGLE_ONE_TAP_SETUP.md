# Google One Tap Login Setup Guide

## Overview
This guide will help you set up Google One Tap login for NexApply, allowing users to sign in with a single click using their Google account.

## Prerequisites
- Google Cloud Console account
- NexApply API and Client projects

---

## Step 1: Google Cloud Console Setup

### 1.1 Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project "NexApply"
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**

### 1.2 Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Select **External** user type
3. Fill in application information:
   - App name: **NexApply**
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
4. Add scopes:
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
   - `openid`
5. Add test users (for development)
6. Save and continue

### 1.3 Create OAuth Client ID

1. Application type: **Web application**
2. Name: **NexApply Web Client**
3. Authorized JavaScript origins:
   - `https://localhost:7000` (development)
   - `https://localhost:5001` (client development)
   - `https://yourdomain.com` (production)
4. Authorized redirect URIs:
   - `https://localhost:7000/api/auth/google-callback` (development)
   - `https://yourdomain.com/api/auth/google-callback` (production)
5. Click **Create**
6. **Copy the Client ID and Client Secret** - you'll need these!

---

## Step 2: Backend Configuration (API)

### 2.1 Add Google Settings to appsettings.json

```json
{
  "Authentication": {
    "Google": {
      "ClientId": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
      "ClientSecret": "YOUR_GOOGLE_CLIENT_SECRET"
    }
  }
}
```

### 2.2 Configure Google Authentication in Program.cs

The configuration is already added. Make sure these lines are in your `Program.cs`:

```csharp
builder.Services.AddAuthentication()
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;
        options.CallbackPath = "/api/auth/google-callback";
        options.SaveTokens = true;
        
        // Request email and profile scopes
        options.Scope.Add("email");
        options.Scope.Add("profile");
    });
```

---

## Step 3: Frontend Configuration (Client)

### 3.1 Add Google Client ID to appsettings.json

```json
{
  "GoogleAuth": {
    "ClientId": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
  }
}
```

### 3.2 Google One Tap is Already Wired Up

The frontend pages (Login.razor and Register.razor) are already configured to use Google One Tap.

---

## Step 4: Testing

### 4.1 Development Testing

1. Make sure both API and Client are running
2. Navigate to `/login` or `/register`
3. Click "Continue with Google"
4. Select your Google account
5. Grant permissions
6. You should be redirected to the dashboard

### 4.2 Test User Flow

**New User:**
1. Click "Continue with Google"
2. Select Google account
3. Account is automatically created
4. Email is auto-verified
5. Redirected to dashboard

**Existing User:**
1. Click "Continue with Google"
2. Select Google account
3. Logged in immediately
4. Redirected to dashboard

---

## Step 5: Production Deployment

### 5.1 Update Authorized Origins

In Google Cloud Console, add your production domain:
- `https://nexapply.com`
- `https://www.nexapply.com`

### 5.2 Update Redirect URIs

- `https://nexapply.com/api/auth/google-callback`
- `https://www.nexapply.com/api/auth/google-callback`

### 5.3 Update appsettings.Production.json

```json
{
  "Authentication": {
    "Google": {
      "ClientId": "YOUR_PRODUCTION_CLIENT_ID",
      "ClientSecret": "YOUR_PRODUCTION_CLIENT_SECRET"
    }
  }
}
```

---

## Security Best Practices

1. ✅ **Never commit credentials** - Use environment variables or Azure Key Vault
2. ✅ **Use HTTPS only** - Google OAuth requires HTTPS
3. ✅ **Validate tokens** - Always verify Google tokens on the backend
4. ✅ **Auto-verify email** - Users from Google have verified emails
5. ✅ **Generate secure passwords** - Create random passwords for Google users
6. ✅ **Handle errors gracefully** - Show user-friendly error messages

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Check that your redirect URI in Google Console matches exactly
- Include the protocol (https://)
- Check for trailing slashes

### Error: "invalid_client"
- Verify Client ID and Client Secret are correct
- Check that credentials are for the correct project

### Error: "access_denied"
- User cancelled the OAuth flow
- User doesn't have permission to access the app

### Google One Tap Not Showing
- Check that Client ID is correct in frontend config
- Verify domain is authorized in Google Console
- Check browser console for errors
- Make sure you're using HTTPS (required for One Tap)

---

## Environment Variables (Recommended)

Instead of hardcoding in appsettings.json, use environment variables:

### Windows (Development)
```powershell
$env:Authentication__Google__ClientId="YOUR_CLIENT_ID"
$env:Authentication__Google__ClientSecret="YOUR_CLIENT_SECRET"
```

### Linux/Mac (Development)
```bash
export Authentication__Google__ClientId="YOUR_CLIENT_ID"
export Authentication__Google__ClientSecret="YOUR_CLIENT_SECRET"
```

### Azure App Service (Production)
Add in Configuration → Application settings:
- `Authentication:Google:ClientId`
- `Authentication:Google:ClientSecret`

---

## Next Steps

1. Get your Google OAuth credentials from Google Cloud Console
2. Add them to `appsettings.json` (or environment variables)
3. Restart the API
4. Test the Google login flow
5. Verify user creation and auto-verification work correctly

---

## Support

If you encounter issues:
1. Check the API logs for detailed error messages
2. Verify all URLs match exactly in Google Console
3. Ensure HTTPS is being used
4. Check that all required scopes are requested
5. Test with a different Google account

The implementation is complete and ready to use once you add your Google OAuth credentials!
