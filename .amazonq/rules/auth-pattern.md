# NexApply — Authentication Pattern

## Overview
Blazor Server authentication using cookie-based JWT tokens with automatic refresh. Tokens are stored in HTTP-only cookies and synchronized to Blazor circuit state for API calls.

## Token Flow
1. User logs in via AuthService
2. JavaScript interop calls API endpoint and stores tokens in HTTP-only cookies
3. TokenCircuitHandler captures AccessToken from cookie claims on circuit connection
4. TokenService holds AccessToken in memory for the circuit lifetime
5. AuthorizationDelegatingHandler attaches Bearer token to outgoing API requests
6. RefreshTokenDelegatingHandler intercepts 401 responses and refreshes tokens automatically

## Components

### AuthService
Handles login, register, logout, email verification. Uses JavaScript interop to call API endpoints and store tokens in cookies. Never stores tokens directly in C# code. Always navigates with forceLoad: true after login to refresh the circuit.

### AuthStateProvider
Reads AccessToken claim from HttpContext.User and parses JWT to create ClaimsPrincipal. Notifies Blazor when authentication state changes. Returns anonymous user if token is missing or invalid.

### TokenService
In-memory token storage scoped to the circuit. Holds AccessToken and RefreshToken for the current user session. Tokens are cleared when circuit disconnects.

### TokenCircuitHandler
Runs on circuit connection. Reads AccessToken from HttpContext.User claims and stores in TokenService. Ensures token is available for API calls during the circuit lifetime.

### AuthorizationDelegatingHandler
Attaches Bearer token to outgoing HTTP requests. Reads AccessToken from HttpContext.User claims. Only attaches token if user is authenticated and token exists. Logs warning if user is authenticated but token is missing.

### RefreshTokenDelegatingHandler
Intercepts 401 Unauthorized responses. Uses SemaphoreSlim to prevent concurrent refresh attempts. Reads RefreshToken from cookie, calls refresh endpoint, updates TokenService with new token, retries original request. Returns original 401 response if refresh fails.

## Key Rules
- Tokens are stored in HTTP-only cookies, never in localStorage or sessionStorage
- AccessToken is read from HttpContext.User claims, not from cookies directly
- TokenService is scoped per circuit, not singleton
- Always use IHttpContextAccessor to access HttpContext
- Never instantiate HttpClient directly, always use IHttpClientFactory
- RefreshTokenDelegatingHandler must be registered before AuthorizationDelegatingHandler in the pipeline
- Always check if user is authenticated before reading token claims
- Use !string.IsNullOrEmpty(token) to validate token exists before attaching to request
- JavaScript interop handles cookie storage, C# code only reads from HttpContext
- Always navigate with forceLoad: true after login to refresh circuit and load new claims

## Registration Order
```
builder.Services.AddHttpClient("ApiClient")
    .AddHttpMessageHandler<RefreshTokenDelegatingHandler>()
    .AddHttpMessageHandler<AuthorizationDelegatingHandler>();
```

RefreshTokenDelegatingHandler runs first to handle token refresh, then AuthorizationDelegatingHandler attaches the token.

## Error Handling
- AuthorizationDelegatingHandler catches exceptions and logs errors, never throws
- RefreshTokenDelegatingHandler returns original 401 response if refresh fails
- AuthStateProvider returns anonymous user if token parsing fails
- AuthService returns false or error message on failure, never throws

## Security Notes
- Tokens are HTTP-only cookies, not accessible via JavaScript
- AccessToken is short-lived, RefreshToken is long-lived
- RefreshToken is only sent to refresh endpoint, never to other API endpoints
- SemaphoreSlim prevents race conditions during concurrent refresh attempts
- Always validate token exists before using it
