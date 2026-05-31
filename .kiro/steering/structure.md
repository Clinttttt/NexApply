# NexApply Project Structure

## Repository Layout

```
NexApply/
├── NexApply.Api/          # Backend (.NET 9 Web API)
├── NexApply.Contracts/    # Shared layer (DTOs, Commands, Queries)
├── NexApply.Web/          # Frontend (React + TypeScript) - CURRENT
├── NexApply.Client/       # DEPRECATED (Old Blazor Server project)
└── NexApply.Tests/        # Tests
```

## Backend Structure (NexApply.Api)

### Vertical Slice Organization

Each feature is organized as a self-contained slice:

```
NexApply.Api/
├── Features/
│   └── {FeatureName}/
│       ├── {VerbNoun}/
│       │   ├── {VerbNoun}Handler.cs      # Business logic (IRequestHandler)
│       │   ├── {VerbNoun}Endpoint.cs     # HTTP endpoint (Minimal API)
│       │   └── {VerbNoun}Validator.cs    # FluentValidation validator
│       └── {FeatureName}Endpoints.cs     # Endpoint registration
├── Entities/                              # DDD domain entities
│   ├── BaseEntity.cs
│   ├── User.cs
│   ├── CompanyProfile.cs
│   ├── StudentProfile.cs
│   ├── JobListing.cs
│   ├── Application.cs
│   └── Enums/                            # Domain-specific enums
├── Data/
│   ├── AppDbContext.cs                   # EF Core DbContext
│   └── AppDbContextFactory.cs
├── Common/
│   ├── Behaviors/
│   │   └── ValidationBehavior.cs         # MediatR pipeline behavior
│   ├── Middleware/
│   │   └── GlobalExceptionMiddleware.cs
│   ├── CurrentUser.cs                    # Auth user service
│   ├── ResultExtensions.cs               # Result<T> to IResult converter
│   └── PaginationExtensions.cs
└── Program.cs                            # Application entry point
```

### Feature Examples

- **Auth**: Login, Register, Refresh, ForgotPassword, ResetPassword, VerifyEmail, SwitchRole
- **JobListings**: CreateJobListing, UpdateJobListing, DeleteJobListing, GetStudentBrowseJobs, GetCompanyJobListings
- **Applications**: Apply, GetMyApplications
- **Profile**: GetStudentProfile, UpdateStudentProfile, UploadResume, UpdateResume, UploadProfilePhoto
- **CompanyApplicants**: GetCompanyApplicants, GetCompanyApplicant, UpdateApplicationStatus, UpdateApplicationNotes
- **SavedJobs**: SaveJob, UnsaveJob, GetSavedJobs
- **Interviews**: ScheduleInterview, GetCompanyInterviews, CompleteInterview
- **Notifications**: GetNotifications, MarkNotificationRead, MarkAllNotificationsRead, DismissNotification

## Contracts Structure (NexApply.Contracts)

Shared layer referenced by both API and Web:

```
NexApply.Contracts/
├── {FeatureName}/
│   ├── {VerbNoun}Command.cs              # Command (IRequest<Result<T>>)
│   ├── {VerbNoun}Query.cs                # Query (IRequest<Result<T>>)
│   └── {Noun}Dto.cs                      # Response DTO
├── Common/
│   └── Result.cs                         # Result<T> wrapper
└── Enums/
    └── UserRole.cs                       # Shared enums (used by both API and Web)
```

## Frontend Structure (NexApply.Web)

React + TypeScript SPA:

```
NexApply.Web/
├── src/
│   ├── components/
│   │   ├── modal/                        # Modal components
│   │   ├── Sidebar.tsx                   # Student navigation
│   │   ├── CompanySidebar.tsx            # Recruiter navigation
│   │   ├── CompanyHeader.tsx             # Recruiter header
│   │   ├── PageHeader.tsx                # Page title component
│   │   ├── StudentHeaderActions.tsx      # Student header actions
│   │   ├── AuthLeftPanel.tsx             # Auth page left panel
│   │   └── ProtectedRoute.tsx            # Route guard
│   ├── pages/
│   │   ├── Auth/                         # Login, Register, ForgotPassword, etc.
│   │   ├── Students/                     # Student pages
│   │   │   ├── Dashboard/
│   │   │   ├── BrowseJobs/
│   │   │   ├── MyApplications/
│   │   │   ├── SavedJobs/
│   │   │   └── Profile/
│   │   └── Company/                      # Recruiter pages
│   │       ├── Dashboard/
│   │       ├── PostJob/
│   │       ├── ManageJobs/
│   │       ├── Applicants/
│   │       ├── Interviews/
│   │       └── CompanyProfile/
│   ├── services/                         # API service layer
│   │   ├── authService.ts
│   │   ├── jobListingService.ts
│   │   ├── applicationService.ts
│   │   ├── studentProfileService.ts
│   │   ├── companyApplicantsService.ts
│   │   ├── savedJobsService.ts
│   │   ├── notificationsService.ts
│   │   └── messageService.ts
│   ├── hooks/                            # Custom React hooks
│   │   └── useGoogleOneTap.ts
│   ├── lib/                              # Utilities
│   │   ├── apiClient.ts                  # Axios instance with interceptors
│   │   └── cookieService.ts              # Cookie utilities
│   ├── types/
│   │   └── index.ts                      # TypeScript type definitions
│   ├── App.tsx                           # Root component with routing
│   └── main.tsx                          # Entry point
├── public/                               # Static assets
└── package.json
```

## Naming Conventions

### Backend (C#)

- **Commands/Queries**: `{VerbNoun}Command.cs` or `{VerbNoun}Query.cs` (in Contracts)
- **DTOs**: `{Noun}Dto.cs` or `{Noun}ResponseDto.cs` (in Contracts)
- **Handlers**: `{VerbNoun}Handler.cs` (in Api/Features)
- **Endpoints**: `{VerbNoun}Endpoint.cs` (in Api/Features)
- **Validators**: `{VerbNoun}Validator.cs` (in Api/Features)
- **Entities**: `{Noun}.cs` (PascalCase, in Api/Entities)

### Frontend (TypeScript)

- **Components**: `ComponentName.tsx` (PascalCase)
- **Pages**: `PageName.tsx` or `PageNamePage.tsx` (PascalCase)
- **Services**: `{feature}Service.ts` (camelCase)
- **Hooks**: `use{FeatureName}.ts` (camelCase)
- **Types**: `index.ts` or `{feature}.types.ts` (camelCase)

## Key Architectural Rules

1. **Commands/Queries go in Contracts** - Never define them in Api handlers
2. **Handlers go in Api** - Business logic lives in handlers, not endpoints
3. **Endpoints are thin** - Map HTTP → MediatR → Result<T> → IResult
4. **Client references Contracts, NOT Api** - Web project never references Api
5. **One slice per feature** - Self-contained with handler, endpoint, validator
6. **Result<T> pattern** - All handlers return Result<T>, no exceptions for expected failures
7. **DDD entities** - Rich domain models with behavior, use factory methods and domain methods
8. **Validation pipeline** - FluentValidation validators auto-discovered via assembly scanning
9. **Global exception handling** - Middleware catches unexpected errors
10. **Cookie-based auth** - JWT tokens in httpOnly cookies, automatic refresh via interceptor
