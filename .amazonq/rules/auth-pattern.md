# NexApply — Authentication Pattern

## Overview
React + TypeScript authentication using httpOnly cookie-based JWT tokens with automatic refresh. Tokens are stored in httpOnly cookies and managed by axios interceptors.

## Token Flow
1. User logs in via authService
2. API sets AccessToken and RefreshToken in httpOnly cookies
3. Axios automatically sends cookies with every request (withCredentials: true)
4. AuthContext fetches current user on app mount
5. Axios interceptor catches 401 responses and refreshes tokens automatically
6. Original request is retried with new token

## Components

### authService
Handles login, register, logout, email verification. Calls API endpoints using axios. Never stores tokens directly in JavaScript code. Tokens are managed by browser cookies.

### AuthContext
Provides authentication state to the entire app. Fetches current user on mount. Exposes user, isAuthenticated, isLoading, login, logout methods. Uses React Context API.

### axios interceptor
Intercepts 401 Unauthorized responses. Calls refresh endpoint with cookies. Retries original request if refresh succeeds. Redirects to login if refresh fails. Prevents concurrent refresh attempts.

### ProtectedRoute
Wrapper component for protected routes. Checks if user is authenticated. Redirects to login if not authenticated. Shows loading spinner while checking auth state.

## Key Rules
- Tokens are stored in httpOnly cookies, never in localStorage or sessionStorage
- Axios sends cookies automatically with withCredentials: true
- Never manually read or write tokens in JavaScript code
- AuthContext is the single source of truth for auth state
- Always use axios instance with interceptors configured
- Refresh token endpoint is called automatically on 401 responses
- Use ProtectedRoute component to guard authenticated routes
- Check isLoading before rendering protected content

## Axios Configuration
```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Send cookies with requests
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        return apiClient(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

## Error Handling
- Axios interceptor catches 401 and attempts refresh
- If refresh fails, redirect to login page
- AuthContext returns null user if fetch fails
- ProtectedRoute redirects to login if not authenticated
- Services return Result<T> with error messages

## Security Notes
- Tokens are httpOnly cookies, not accessible via JavaScript
- AccessToken is short-lived, RefreshToken is long-lived
- RefreshToken is only sent to refresh endpoint
- _retry flag prevents infinite refresh loops
- Always validate user exists before accessing user properties
- Use HTTPS in production to prevent cookie theft
