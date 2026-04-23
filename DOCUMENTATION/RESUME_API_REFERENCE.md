# Resume API - Quick Reference

## Current Profile Endpoints (After Refactor)

### 1. Get Student Profile
```http
GET /api/profile/student
Authorization: Bearer {token}
```
**Returns:** `StudentProfileDto` with basic profile info (name, phone, location, etc.)

---

### 2. Update Student Profile
```http
PUT /api/profile/student
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "John Doe",
  "phone": "+63 912 345 6789",
  "location": "Manila, Philippines",
  "university": "University of Example",
  "course": "Computer Science",
  "graduationYear": 2025,
  "linkedIn": "https://linkedin.com/in/johndoe",
  "gitHub": "https://github.com/johndoe",
  "portfolio": "https://johndoe.dev"
}
```
**Returns:** `StudentProfileDto`

---

### 3. Upload Resume File
```http
POST /api/profile/resume/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [PDF/DOCX file, max 5MB]
```
**Returns:** `ResumeUploadDto` with parsed text

---

### 4. Get Resume Content
```http
GET /api/profile/resume
Authorization: Bearer {token}
```
**Returns:** `ResumeContentDto` with:
- `Headline` (string)
- `AboutMe` (string)
- `Education` (array of EducationDto)
- `WorkExperience` (array of WorkExperienceDto)
- `Skills` (array of strings)

---

### 5. Update Resume (NEW - Replaces 8 old endpoints)
```http
PUT /api/profile/resume
Authorization: Bearer {token}
Content-Type: application/json

{
  "headline": "Full Stack Developer",
  "aboutMe": "Passionate developer with 3 years of experience...",
  "educationJson": "[{\"Organization\":\"University\",\"Period\":\"2021-2025\",\"Title\":\"BS Computer Science\",\"Description\":\"Dean's List\"}]",
  "workExperienceJson": "[{\"Organization\":\"Tech Co\",\"Period\":\"2023-Present\",\"Title\":\"Intern\",\"Description\":\"Built features\"}]",
  "skillsJson": "[\"C#\",\".NET\",\"React\",\"PostgreSQL\"]"
}
```
**Returns:** `ResumeContentDto`

---

## Old Endpoints (REMOVED)

These endpoints no longer exist:

- ❌ `PUT /api/profile/resume/headline` - Use UpdateResume instead
- ❌ `PUT /api/profile/resume/about` - Use UpdateResume instead
- ❌ `POST /api/profile/resume/education` - Use UpdateResume instead
- ❌ `DELETE /api/profile/resume/education/{id}` - Use UpdateResume instead
- ❌ `POST /api/profile/resume/experience` - Use UpdateResume instead
- ❌ `DELETE /api/profile/resume/experience/{id}` - Use UpdateResume instead
- ❌ `POST /api/profile/resume/skills` - Use UpdateResume instead
- ❌ `DELETE /api/profile/resume/skills/{name}` - Use UpdateResume instead

---

## Client Usage

### ProfileApiService Methods

```csharp
public interface IProfileApiService
{
    // Profile
    Task<Result<StudentProfileDto>> GetStudentProfile();
    Task<Result<StudentProfileDto>> UpdateStudentProfile(UpdateStudentProfileCommand request);
    
    // Resume
    Task<Result<ResumeUploadDto>> UploadResume(UploadResumeCommand request);
    Task<Result<ResumeContentDto>> GetResumeContent();
    Task<Result<ResumeContentDto>> UpdateResume(UpdateResumeCommand request);
}
```

### Example: Save Resume Data

```csharp
// In ResumeDocument.razor
public async Task SaveResumeData()
{
    // Serialize data to JSON
    var educationJson = JsonSerializer.Serialize(_education);
    var experienceJson = JsonSerializer.Serialize(_experience);
    var skillsJson = JsonSerializer.Serialize(_skills.Select(s => s.Name));

    // Create command
    var command = new UpdateResumeCommand(
        _headline,
        _about,
        educationJson,
        experienceJson,
        skillsJson
    );

    // Single API call
    var result = await ProfileApi.UpdateResume(command);
    
    if (result.IsSuccess)
    {
        // Success!
    }
}
```

---

## Database Schema

### Resumes Table

| Column | Type | Description |
|--------|------|-------------|
| Id | uuid | Primary key |
| StudentProfileId | uuid | Foreign key to StudentProfiles |
| Headline | varchar(200) | Professional headline |
| AboutMe | text | Professional summary |
| EducationJson | text | JSON array of education entries |
| WorkExperienceJson | text | JSON array of work entries |
| SkillsJson | text | JSON array of skill names |
| CreatedAt | timestamptz | Creation timestamp |
| UpdatedAt | timestamptz | Last update timestamp |

**Indexes:**
- Primary key on Id
- Unique index on StudentProfileId (one resume per student)

---

## Migration

**Migration Name:** `SimplifyResumeArchitecture`  
**Applied:** 2026-04-23  
**Status:** ✅ Complete

To rollback (if needed):
```bash
dotnet ef database update PreviousMigrationName --project NexApply.Api
```

---

## Testing

### Manual Test Steps

1. **Login** as a student
2. **Navigate** to Profile page
3. **Click "Build"** to enter edit mode
4. **Add data:**
   - Education: University, 2021-2025, BS Computer Science
   - Work Experience: Tech Co, 2023-Present, Intern
   - Skills: C#, .NET, React
   - Headline: Full Stack Developer
   - About Me: Professional summary
5. **Click "Lock"** to save
6. **Refresh page** - data should persist
7. **Check browser console** - no errors
8. **Check profile strength** - should update

### API Test (Postman/curl)

```bash
# Get resume content
curl -X GET http://localhost:5000/api/profile/resume \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update resume
curl -X PUT http://localhost:5000/api/profile/resume \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "Full Stack Developer",
    "aboutMe": "Passionate developer...",
    "educationJson": "[{\"Organization\":\"University\",\"Period\":\"2021-2025\",\"Title\":\"BS CS\",\"Description\":\"Dean'\''s List\"}]",
    "workExperienceJson": "[]",
    "skillsJson": "[\"C#\",\".NET\"]"
  }'
```

---

## Troubleshooting

### Issue: Data not persisting after Lock
**Solution:** Check browser console for API errors. Verify token is valid.

### Issue: 400 Bad Request
**Solution:** Check JSON format in educationJson, workExperienceJson, skillsJson. Must be valid JSON strings.

### Issue: 401 Unauthorized
**Solution:** Ensure user is logged in and token is attached to request.

### Issue: 500 Internal Server Error
**Solution:** Check API logs. Verify database connection. Check migration applied.

---

**Last Updated:** 2026-04-23  
**Version:** 2.0 (Simplified Architecture)
