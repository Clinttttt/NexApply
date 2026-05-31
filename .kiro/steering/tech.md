# NexApply Tech Stack

## Backend

**Framework**: .NET 9 Web API (Minimal API)
**Database**: PostgreSQL with EF Core 9.0.4
**Architecture**: Vertical Slice Architecture + Domain-Driven Design (DDD)
**Patterns**: CQRS with MediatR, Result<T> pattern

### Key Libraries

- **MediatR** 14.1.0 - CQRS command/query handling
- **FluentValidation** 12.1.1 - Request validation
- **Npgsql.EntityFrameworkCore.PostgreSQL** 9.0.4 - PostgreSQL provider
- **Microsoft.AspNetCore.Authentication.JwtBearer** 9.0.4 - JWT authentication
- **Google.Apis.Auth** 1.73.0 - Google OAuth integration
- **System.IdentityModel.Tokens.Jwt** 8.17.0 - JWT token generation
- **DotNetEnv** 3.1.1 - Environment variable management

## Frontend

**Framework**: React 19 + TypeScript 6.0
**Build Tool**: Vite 8.0
**Styling**: Tailwind CSS 4.2
**Routing**: React Router v7.14
**HTTP Client**: Axios 1.15
**State Management**: TanStack Query (React Query) 5.100

### Key Libraries

- **@tanstack/react-query** - Server state management
- **axios** - HTTP client for API calls
- **react-router-dom** - Client-side routing
- **pdfjs-dist** - PDF rendering for resume viewer
- **js-cookie** - Cookie utilities

## Shared Layer

**NexApply.Contracts** - Shared DTOs, Commands, Queries, Result<T>, Enums
- Referenced by both API and Web projects
- Contains MediatR.Contracts only

## Common Commands

### Backend (API)

```bash
# Run development server
dotnet run --project NexApply.Api

# Build
dotnet build

# Run tests
dotnet test

# Create migration
dotnet ef migrations add MigrationName --project NexApply.Api

# Apply migrations
dotnet ef database update --project NexApply.Api

# Restore packages
dotnet restore
```

### Frontend (Web)

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Install dependencies
npm install
```

## Environment Configuration

### Backend (.env or appsettings.Development.json)

- `ConnectionStrings:DefaultConnection` - PostgreSQL connection string
- `Jwt:Key` - JWT signing key
- `Jwt:Issuer` - JWT issuer
- `Jwt:Audience` - JWT audience
- `Google:ClientId` - Google OAuth client ID
- `Google:ClientSecret` - Google OAuth client secret

### Frontend (.env)

- `VITE_API_BASE_URL` - Backend API base URL (e.g., http://localhost:5000)

## Authentication

- **Token Storage**: httpOnly cookies (set by backend)
- **Token Type**: JWT Bearer tokens
- **Refresh Flow**: Automatic via axios interceptor
- **OAuth**: Google One Tap integration

## Database

- **Provider**: PostgreSQL
- **ORM**: Entity Framework Core
- **Migrations**: Code-first with EF Core migrations
- **Time Handling**: Always use `DateTime.UtcNow` (never `DateTime.Now`)
