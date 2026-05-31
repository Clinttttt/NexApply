# Fixed Hardcoded Testimonials and Stats Display

## Issue
The landing page (Login/Register) was displaying hardcoded testimonials because the frontend was calling a non-existent `/testimonials` endpoint.

## Root Cause
- Frontend `testimonialService.ts` was calling `/testimonials` endpoint
- Backend had no such endpoint
- The correct endpoint should be `/api/public/feedback`

## Changes Made

### Backend (NexApply.Api)

#### 1. Added Feedback Field to StudentProfile Entity
**File:** `NexApply.Api/Entities/StudentProfile.cs`
- Added `public string? Feedback { get; private set; }` property
- Added `UpdateFeedback(string? feedback)` method

#### 2. Updated AppDbContext
**File:** `NexApply.Api/Data/AppDbContext.cs`
- Added Feedback field configuration: `e.Property(s => s.Feedback).HasColumnType("text");`

#### 3. Created GetPublicFeedback Feature
**Files Created:**
- `NexApply.Contracts/PublicStats/GetPublicFeedback.cs` - Query and DTO
- `NexApply.Api/Features/PublicStats/GetPublicFeedback/GetPublicFeedbackHandler.cs` - Handler
- `NexApply.Api/Features/PublicStats/GetPublicFeedback/GetPublicFeedbackEndpoint.cs` - Endpoint

**Endpoint:** `GET /api/public/feedback` (Anonymous)
- Returns list of student feedback with name, role (university), and testimonial
- Randomly selects up to 10 feedback entries

#### 4. Created UpdateStudentFeedback Feature
**Files Created:**
- `NexApply.Contracts/StudentSettings/UpdateStudentFeedbackCommand.cs` - Command
- `NexApply.Api/Features/StudentSettings/UpdateStudentFeedback/UpdateStudentFeedbackHandler.cs` - Handler
- `NexApply.Api/Features/StudentSettings/UpdateStudentFeedback/UpdateStudentFeedbackEndpoint.cs` - Endpoint

**Endpoint:** `PUT /api/student/settings/feedback` (Authenticated)
- Allows students to submit/update their feedback

#### 5. Updated StudentSettings
**Files Modified:**
- `NexApply.Contracts/StudentSettings/StudentSettingsDto.cs` - Added `Feedback` property
- `NexApply.Api/Features/StudentSettings/GetStudentSettings/GetStudentSettingsHandler.cs` - Include feedback in response
- `NexApply.Api/Features/StudentSettings/StudentSettingsEndpoints.cs` - Register UpdateStudentFeedback endpoint

#### 6. Registered Endpoints
**File:** `NexApply.Api/Program.cs`
- Added `using NexApply.Api.Features.PublicStats.GetPublicFeedback;`
- Added `app.MapGetPublicFeedback();`

#### 7. Database Migration
**Migration:** `20260530111629_AddStudentFeedback`
- Adds `Feedback` column to `StudentProfiles` table
- Applied successfully to database

### Frontend (NexApply.Web)

#### 1. Fixed testimonialService
**File:** `NexApply.Web/src/services/testimonialService.ts`
- Changed endpoint from `/testimonials` to `/api/public/feedback`

## How It Works Now

1. **Landing Page Load:**
   - `AuthLeftPanel` component mounts
   - Calls `testimonialService.getTestimonials()` → `/api/public/feedback`
   - Calls `publicStatsService.getStats()` → `/api/public/stats`

2. **Backend Response:**
   - `/api/public/feedback` returns random student feedback from database
   - `/api/public/stats` returns active listings and companies count

3. **Display:**
   - If feedback exists in DB → displays real testimonials
   - If no feedback → falls back to hardcoded testimonials
   - Stats display dynamically (e.g., "15+ Active listings", "3+ Companies")

4. **Students Can Submit Feedback:**
   - Go to Settings page
   - Submit feedback via `PUT /api/student/settings/feedback`
   - Feedback appears on landing page for other users

## API Endpoints Summary

### Public Endpoints (No Auth Required)
```
GET /api/public/stats
Response: { activeListings: number, companies: number }

GET /api/public/feedback
Response: [{ studentName: string, role: string, testimonial: string }]
```

### Student Endpoints (Auth Required)
```
GET /api/student/settings
Response: { email: string, hasPassword: bool, signInMethod: string, feedback: string? }

PUT /api/student/settings/feedback
Body: { feedback: string? }
Response: { isSuccess: bool }
```

## Testing

✅ Backend builds successfully
✅ Database migration applied
✅ Endpoints registered correctly
✅ Frontend service updated to call correct endpoint
✅ Fallback testimonials work if no feedback in DB

## Next Steps

To see dynamic testimonials:
1. Start the backend API
2. Start the frontend
3. Register as a student
4. Go to Settings and submit feedback
5. Logout and view the landing page - your feedback should appear!
