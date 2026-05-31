# Student Feedback Feature Implementation

## Overview
Added a feedback/comment feature to the Student Settings page where students can share their thoughts about the NexApply application. The feedback is then dynamically displayed on the authentication pages (Login/Register) as testimonials.

## Changes Made

### Backend (NexApply.Api)

#### 1. Database Changes
- **Entity Update**: Added `AppFeedback` property to `StudentProfile` entity
  - File: `NexApply.Api/Entities/StudentProfile.cs`
  - Added nullable string property `AppFeedback`
  - Added domain method `UpdateAppFeedback(string? feedback)`

- **Migration**: Created database migration
  - File: `NexApply.Api/Migrations/20260527091147_AddAppFeedbackToStudentProfile.cs`
  - Adds `AppFeedback` column to `StudentProfiles` table (text type, nullable)

- **DbContext Configuration**: Updated `AppDbContext`
  - Added `AppFeedback` property configuration with `text` column type

#### 2. Contracts (NexApply.Contracts)
- **DTO Update**: Added `AppFeedback` property to `StudentSettingsDto`
  - File: `NexApply.Contracts/StudentSettings/StudentSettingsDto.cs`
  
- **New Command**: Created `UpdateAppFeedbackCommand`
  - File: `NexApply.Contracts/StudentSettings/UpdateAppFeedbackCommand.cs`
  - Takes feedback string (nullable) as parameter

- **New Query**: Created `GetPublicFeedbackQuery`
  - File: `NexApply.Contracts/StudentSettings/GetPublicFeedbackQuery.cs`
  - Returns list of public feedback for display

- **New DTO**: Created `PublicFeedbackDto`
  - File: `NexApply.Contracts/StudentSettings/PublicFeedbackDto.cs`
  - Contains feedback, student initials, name, and university

#### 3. Feature Slice: UpdateAppFeedback
Following Vertical Slice Architecture pattern:

- **Handler**: `UpdateAppFeedbackHandler.cs`
  - Validates user and student profile exist
  - Updates feedback using domain method
  - Returns updated settings DTO
  
- **Endpoint**: `UpdateAppFeedbackEndpoint.cs`
  - PUT `/api/student/settings/feedback`
  - Requires Student role authorization
  
- **Validator**: `UpdateAppFeedbackValidator.cs`
  - Max length: 2000 characters

#### 4. Feature Slice: GetPublicFeedback (NEW)
Public endpoint for displaying feedback as testimonials:

- **Handler**: `GetPublicFeedbackHandler.cs`
  - Fetches up to 10 random feedback entries
  - Generates initials from student names
  - Returns anonymized feedback data
  
- **Endpoint**: `GetPublicFeedbackEndpoint.cs`
  - GET `/api/public/feedback`
  - Anonymous access (no authentication required)

- **Endpoint Registration**: Updated `StudentSettingsEndpoints.cs`
  - Registered both endpoints

#### 5. Updated GetStudentSettings
- Modified handler to include `StudentProfile` and return `AppFeedback`
- File: `NexApply.Api/Features/StudentSettings/GetStudentSettings/GetStudentSettingsHandler.cs`

### Frontend (NexApply.Web)

#### 1. Service Layer
- **Updated Service**: `studentSettingsService.ts`
  - Added `appFeedback` to `StudentSettingsDto` interface
  - Added `PublicFeedbackDto` interface
  - Added `updateAppFeedback()` method
  - Added `getPublicFeedback()` method (public endpoint)

#### 2. UI Component - Settings Page
- **Updated Page**: `StudentSettings.tsx`
  - Added state management for feedback (value, dirty flag, loading, messages)
  - Added `onSaveFeedback()` handler
  - Added new "App Feedback" section with:
    - Textarea input (4 rows, 2000 char limit)
    - Character counter
    - Save button (disabled when no changes)
    - Success/error messages
    - Auto-dismiss success message after 3 seconds

#### 3. UI Component - Auth Pages (NEW)
- **Updated Component**: `AuthLeftPanel.tsx`
  - Now fetches real feedback from `/api/public/feedback`
  - Dynamically displays student feedback as testimonials
  - Falls back to hardcoded testimonials if no feedback available
  - Uses `useEffect` to load feedback on component mount
  - Maps feedback to testimonial format with rotating colors

## UI Layout

### Settings Page
The feedback section is positioned between "Notifications" and "Security" sections in the settings grid, maintaining consistency with the existing design system.

### Auth Pages (Login/Register)
The left panel now displays real student feedback in the scrolling testimonial ticker instead of hardcoded testimonials.

## Features
- ✅ Students can write feedback about the app (up to 2000 characters)
- ✅ Feedback is optional (can be empty)
- ✅ Real-time character counter
- ✅ Feedback persists across sessions
- ✅ Success/error feedback messages
- ✅ **Dynamic testimonials on auth pages** (NEW)
- ✅ **Public API endpoint for feedback** (NEW)
- ✅ **Automatic initials generation** (NEW)
- ✅ **Random feedback selection** (NEW)
- ✅ Follows existing design patterns and styling
- ✅ Proper validation (max 2000 chars)
- ✅ Authorization (Student role for updates, public for viewing)

## API Endpoints

### Student Endpoints (Authenticated)
- `GET /api/student/settings` - Get student settings including feedback
- `PUT /api/student/settings/feedback` - Update student feedback

### Public Endpoints (Anonymous)
- `GET /api/public/feedback` - Get up to 10 random student feedback entries for display

## Database Migration
The migration has been successfully applied to the database:
```bash
dotnet ef database update --project NexApply.Api
```

✅ Migration applied: `20260527091147_AddAppFeedbackToStudentProfile`

## Testing
All components build and run successfully:
- ✅ Backend: `dotnet build` - Success
- ✅ Frontend: `npm run build` (in NexApply.Web) - Success
- ✅ Database: Migration applied successfully

## Architecture Compliance
This implementation follows all NexApply architectural patterns:
- ✅ Vertical Slice Architecture
- ✅ CQRS with MediatR
- ✅ Result<T> pattern
- ✅ FluentValidation
- ✅ Domain-driven design (domain method on entity)
- ✅ Proper separation: Contracts vs Api
- ✅ Cookie-based auth with role authorization
- ✅ Consistent naming conventions
- ✅ Existing design system and styling
