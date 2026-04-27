# Google One Tap Setup - React

## ✅ What's Configured

### Frontend (React)
- ✅ Google One Tap SDK loaded in `index.html`
- ✅ Helper script `public/google-one-tap.js`
- ✅ React hook `useGoogleOneTap.ts`
- ✅ Login page with Google button
- ✅ Register page with Google button

### Backend (API)
- ✅ Endpoint: `POST /api/auth/login-google`
- ✅ Accepts: `{ idToken: string }`
- ✅ Returns: `{ accessToken, refreshToken }`

---

## 🔧 How It Works

### 1. User clicks "Continue with Google"
- Google SDK shows account picker
- User selects Google account
- Google returns JWT credential (idToken)

### 2. Frontend sends idToken to API
```typescript
POST /api/auth/login-google
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

### 3. Backend validates token
- Verifies JWT signature with Google
- Extracts email, name from token
- Creates user if doesn't exist
- Auto-verifies email (Google accounts are verified)
- Returns access + refresh tokens

### 4. Frontend stores tokens
- Tokens saved in cookies
- User redirected to `/dashboard`

---

## 🎨 UI Components

### Login Page
```tsx
import { useGoogleOneTap } from '../hooks/useGoogleOneTap';

export function Login() {
  const { renderButton } = useGoogleOneTap();

  useEffect(() => {
    renderButton('google-signin-button');
  }, [renderButton]);

  return (
    <div id="google-signin-button" style={{ width: '100%' }}></div>
  );
}
```

### Register Page
```tsx
import { useGoogleOneTap } from '../hooks/useGoogleOneTap';

export function Register() {
  const { renderButton } = useGoogleOneTap();

  useEffect(() => {
    renderButton('google-signup-button');
  }, [renderButton]);

  return (
    <div id="google-signup-button" style={{ width: '100%' }}></div>
  );
}
```

---

## 🔑 Configuration

### Current Client ID (Development)
```javascript
clientId: '7329258126-0t1m7td7lm4ltekdm3v2bne6fndke9qj.apps.googleusercontent.com'
```

This is already configured in:
- `public/google-one-tap.js`
- Backend `appsettings.json`

### For Production
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new OAuth 2.0 credentials
3. Add authorized origins:
   - `https://yourdomain.com`
4. Update `public/google-one-tap.js`:
   ```javascript
   window.googleConfig = {
     clientId: 'YOUR_PRODUCTION_CLIENT_ID'
   };
   ```

---

## 🧪 Testing

### Test Flow
1. Start API: `cd NexApply.Api && dotnet run`
2. Start React: `cd NexApply.Web && npm run dev`
3. Go to `http://localhost:3000/login`
4. Click Google button
5. Select Google account
6. Should redirect to `/dashboard`

### New User
- Account created automatically
- Email auto-verified
- Random password generated
- Tokens returned

### Existing User
- Logged in immediately
- Tokens returned

---

## 🎯 Button Customization

Google SDK renders the button with these options:

```javascript
google.accounts.id.renderButton(element, {
  theme: 'outline',           // 'outline' | 'filled_blue' | 'filled_black'
  size: 'large',              // 'large' | 'medium' | 'small'
  width: '100%',              // Custom width
  text: 'continue_with',      // 'signin_with' | 'signup_with' | 'continue_with'
  shape: 'rectangular',       // 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment: 'left'      // 'left' | 'center'
});
```

To customize, edit `public/google-one-tap.js`:

```javascript
window.renderGoogleButton = (elementId) => {
  google.accounts.id.renderButton(
    document.getElementById(elementId),
    {
      theme: 'filled_blue',    // Change theme
      size: 'medium',          // Change size
      text: 'signin_with',     // Change text
      // ... other options
    }
  );
};
```

---

## 🔒 Security

### Token Validation
- Backend validates JWT signature with Google
- Checks token expiry
- Verifies audience matches Client ID
- Extracts verified email from token

### Auto-Verification
- Google accounts are pre-verified
- No email verification needed
- User.IsEmailVerified = true on creation

### Password Generation
- Random secure password generated for Google users
- User can set custom password later
- Password never exposed to user

---

## 🐛 Troubleshooting

### Button Not Showing
- Check browser console for errors
- Verify Google SDK loaded: `window.google`
- Check Client ID is correct
- Ensure element ID exists in DOM

### "Invalid Client ID"
- Verify Client ID in `google-one-tap.js`
- Check Client ID in Google Cloud Console
- Ensure domain is authorized

### "redirect_uri_mismatch"
- Add `http://localhost:3000` to authorized origins
- Add `https://localhost:7001` to authorized origins

### Login Fails
- Check API logs for errors
- Verify `/api/auth/login-google` endpoint exists
- Check token validation in backend
- Ensure CORS allows requests

---

## 📝 Files Modified

```
NexApply.Web/
├── index.html                          ← Added Google SDK
├── public/
│   └── google-one-tap.js              ← Google helper script
├── src/
│   ├── hooks/
│   │   └── useGoogleOneTap.ts         ← React hook
│   └── pages/
│       ├── Login.tsx                   ← Google button
│       └── Register.tsx                ← Google button
```

---

## 🚀 Next Steps

1. ✅ Google One Tap configured
2. ⏳ Test with real Google account
3. ⏳ Add error handling UI
4. ⏳ Add loading state during auth
5. ⏳ Configure production Client ID

---

## 📚 Resources

- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [One Tap Sign-In](https://developers.google.com/identity/gsi/web/guides/overview)
- [Button Customization](https://developers.google.com/identity/gsi/web/reference/js-reference#GsiButtonConfiguration)
