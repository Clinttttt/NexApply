# NexApply Tests

## Test Structure

```
NexApply.Tests/
├── Integration/          # API integration tests
│   └── AuthenticationTests.cs
├── Unit/                 # Unit tests
│   └── AuthApiServiceTests.cs
└── TestWebApplicationFactory.cs
```

## Running Tests

### Run All Tests
```bash
dotnet test
```

### Run Specific Test Class
```bash
dotnet test --filter "FullyQualifiedName~AuthenticationTests"
```

### Run Single Test
```bash
dotnet test --filter "FullyQualifiedName~Login_WithValidCredentials_ReturnsTokens"
```

### Run with Detailed Output
```bash
dotnet test --logger "console;verbosity=detailed"
```

## Test Coverage

### Integration Tests (AuthenticationTests)
✅ Login with valid credentials returns tokens
✅ Login with invalid credentials returns unauthorized
✅ Login with wrong password returns unauthorized
✅ Switch role with valid token returns new token
✅ Switch role without authentication returns unauthorized
✅ Login returns valid JWT token structure

### Unit Tests (AuthApiServiceTests)
✅ LoginWithEmail success returns tokens
✅ LoginWithEmail failure returns error
✅ LoginWithEmail calls correct endpoint

## Test Database

Integration tests use **InMemory database** - no PostgreSQL required for testing.

## Notes

- Tests are isolated - each test gets a fresh database
- JWT tokens are validated for structure (3 parts separated by dots)
- Role switching is tested end-to-end
- HTTP status codes are verified
