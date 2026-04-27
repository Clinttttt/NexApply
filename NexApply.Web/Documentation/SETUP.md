# NexApply.Web - API Integration Setup

## ✅ What's Been Configured

### 1. **Auth Service** (`src/services/authService.ts`)
- ✅ Login with email/password
- ✅ Register with full validation
- ✅ Token storage in cookies
- ✅ Logout functionality
- ✅ Authentication check

### 2. **API Client** (`src/lib/apiClient.ts`)
- ✅ Axios instance with base URL `/api`
- ✅ Auto-attach Bearer token to requests
- ✅ Auto-refresh token on 401
- ✅ Proxy configured in `vite.config.ts` → `https://localhost:7001`

### 3. **Cookie Service** (`src/lib/cookieService.ts`)
- ✅ Secure cookie storage (HTTP-only in production)
- ✅ Access token (1 day expiry)
- ✅ Refresh token (7 days expiry)

### 4. **Pages**
- ✅ Login page with role toggle (Student/Recruiter)
- ✅ Register page with validation
- ✅ Dashboard (protected route)

### 5. **Protected Routes**
- ✅ Redirect to `/login` if not authenticated
- ✅ Allow access to dashboard if authenticated

---

## 🚀 How to Run

### 1. Start the API (Backend)
```bash
cd NexApply.Api
dotnet run
```
API runs on: `https://localhost:7001`

### 2. Start the React App (Frontend)
```bash
cd NexApply.Web
npm install  # if first time
npm run dev
```
React app runs on: `http://localhost:3000`

---

## 🔌 API Endpoints Used

### Login
- **POST** `/api/auth/login`
- **Body:** `{ email: string, password: string }`
- **Response:** `{ accessToken: string, refreshToken: string }`

### Register
- **POST** `/api/auth/register`
- **Body:** 
  ```json
  {
    "fullName": "string",
    "username": "string",
    "email": "string",
    "password": "string",
    "confirmPassword": "string",
    "role": "Student" | "Company"
  }
  ```
- **Response:** `{ accessToken: string, refreshToken: string }`

### Refresh Token
- **POST** `/api/auth/refresh`
- **Body:** `{ refreshToken: string }`
- **Response:** `{ accessToken: string, refreshToken: string }`

---

## 🔐 Authentication Flow

1. User logs in → API returns tokens
2. Tokens stored in cookies (secure, httpOnly in prod)
3. Every API request includes `Authorization: Bearer {accessToken}`
4. If 401 response → Auto-refresh token → Retry request
5. If refresh fails → Redirect to login

---

## 📝 Key Files

```
NexApply.Web/
├── src/
│   ├── services/
│   │   └── authService.ts          ← Login, Register, Logout
│   ├── lib/
│   │   ├── apiClient.ts            ← Axios instance with interceptors
│   │   └── cookieService.ts        ← Token storage
│   ├── pages/
│   │   ├── Login.tsx               ← Login page
│   │   ├── Register.tsx            ← Register page
│   │   └── Dashboard.tsx           ← Protected dashboard
│   ├── components/
│   │   └── ProtectedRoute.tsx      ← Route guard
│   └── types/
│       └── index.ts                ← Shared types
└── vite.config.ts                  ← Proxy config
```

---

## 🧪 Testing

### Test Login
1. Go to `http://localhost:3000/login`
2. Enter credentials (must exist in DB)
3. Click "Sign in"
4. Should redirect to `/dashboard`

### Test Register
1. Go to `http://localhost:3000/register`
2. Fill in all fields
3. Select role (Student/Recruiter)
4. Click "Create account"
5. Should redirect to `/dashboard`

### Test Protected Route
1. Go to `http://localhost:3000/dashboard` (without login)
2. Should redirect to `/login`

---

## 🐛 Troubleshooting

### CORS Issues
Make sure API has CORS configured:
```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

app.UseCors("AllowReact");
```

### SSL Certificate Issues
Vite proxy has `secure: false` for dev. In production, use valid SSL.

### Token Not Attaching
Check browser DevTools → Network → Request Headers → Should see `Authorization: Bearer ...`

---

## 🎯 Next Steps

1. ✅ Login/Register working
2. ⏳ Add email verification flow
3. ⏳ Add forgot password flow
4. ⏳ Add Google OAuth
5. ⏳ Add profile pages
6. ⏳ Add job listing pages

---

## 📚 API Contract Reference

All commands/queries are in `NexApply.Contracts`:
- `LoginCommand` → `(Email, Password)`
- `RegisterCommand` → `(FullName, Username, Email, Password, ConfirmPassword, Role)`
- `TokenResponseDto` → `(AccessToken, RefreshToken)`

Role enum: `Student` or `Company` (not "Recruiter" in backend)
