# Profile API Endpoints

## Overview
Complete Profile & Resume management endpoints following VSA architecture.

---

## Student Profile Endpoints

### Get Student Profile
**GET** `/api/profile/student`
- **Auth:** Required
- **Returns:** `StudentProfileDto`
- **Description:** Get current user's profile information

### Update Student Profile
**PUT** `/api/profile/student`
- **Auth:** Required
- **Body:** `UpdateStudentProfileCommand`
  ```json
  {
    "fullName": "string",
    "phone": "string?",
    "location": "string?",
    "university": "string?",
    "course": "string?",
    "graduationYear": "int?",
    "linkedIn": "string?",
    "gitHub": "string?",
    "portfolio": "string?"
  }
  ```
- **Returns:** `StudentProfileDto`
- **Description:** Update profile information

---

## Resume Upload

### Upload Resume
**POST** `/api/profile/resume/upload`
- **Auth:** Required
- **Body:** `UploadResumeCommand`
  ```json
  {
    "fileName": "string",
    "contentType": "string",
    "fileData": "byte[]"
  }
  ```
- **Returns:** `ResumeUploadDto`
- **Validation:** Max 5MB, PDF/DOCX/Image only
- **Description:** Upload resume file (PDF, DOCX, or image)

---

## Resume Content Endpoints

### Get Resume Content
**GET** `/api/profile/resume/content`
- **Auth:** Required
- **Returns:** `ResumeContentDto` (headline, about me, education, work experience, skills)
- **Description:** Get complete resume content with all sections

### Update Resume Headline
**PUT** `/api/profile/resume/headline`
- **Auth:** Required
- **Body:** `UpdateResumeHeadlineCommand`
  ```json
  {
    "headline": "string"
  }
  ```
- **Returns:** `bool`
- **Validation:** Max 200 characters
- **Description:** Update resume headline/title

### Update About Me
**PUT** `/api/profile/resume/about`
- **Auth:** Required
- **Body:** `UpdateAboutMeCommand`
  ```json
  {
    "aboutMe": "string"
  }
  ```
- **Returns:** `bool`
- **Validation:** Max 2000 characters
- **Description:** Update about me section

---

## Education Endpoints

### Add Education
**POST** `/api/profile/resume/education`
- **Auth:** Required
- **Body:** `AddEducationCommand`
  ```json
  {
    "institution": "string",
    "degree": "string",
    "field": "string?",
    "startYear": "int?",
    "endYear": "int?",
    "description": "string?"
  }
  ```
- **Returns:** `EducationDto`
- **Description:** Add education entry

### Remove Education
**DELETE** `/api/profile/resume/education/{id}`
- **Auth:** Required
- **Params:** `id` (Guid)
- **Returns:** `bool`
- **Description:** Remove education entry by ID

---

## Work Experience Endpoints

### Add Work Experience
**POST** `/api/profile/resume/work-experience`
- **Auth:** Required
- **Body:** `AddWorkExperienceCommand`
  ```json
  {
    "company": "string",
    "position": "string",
    "location": "string?",
    "startDate": "DateTime?",
    "endDate": "DateTime?",
    "isCurrent": "bool",
    "description": "string?"
  }
  ```
- **Returns:** `WorkExperienceDto`
- **Description:** Add work experience entry

### Remove Work Experience
**DELETE** `/api/profile/resume/work-experience/{id}`
- **Auth:** Required
- **Params:** `id` (Guid)
- **Returns:** `bool`
- **Description:** Remove work experience entry by ID

---

## Skills Endpoints

### Add Skill
**POST** `/api/profile/resume/skills`
- **Auth:** Required
- **Body:** `AddSkillCommand`
  ```json
  {
    "skill": "string"
  }
  ```
- **Returns:** `bool`
- **Validation:** Max 50 characters, no duplicates
- **Description:** Add skill to profile

### Remove Skill
**DELETE** `/api/profile/resume/skills/{skill}`
- **Auth:** Required
- **Params:** `skill` (string)
- **Returns:** `bool`
- **Description:** Remove skill by name

---

## Architecture

### Commands (NexApply.Contracts/Profile/Commands/)
- `UpdateStudentProfileCommand`
- `UploadResumeCommand`
- `UpdateResumeHeadlineCommand`
- `UpdateAboutMeCommand`
- `AddEducationCommand`
- `RemoveEducationCommand`
- `AddWorkExperienceCommand`
- `RemoveWorkExperienceCommand`
- `AddSkillCommand`
- `RemoveSkillCommand`

### Queries (NexApply.Contracts/Profile/Queries/)
- `GetStudentProfileQuery`
- `GetResumeContentQuery`

### DTOs (NexApply.Contracts/Profile/Dtos/)
- `StudentProfileDto`
- `ResumeUploadDto`
- `ResumeContentDto`
- `EducationDto`
- `WorkExperienceDto`

### Entities (NexApply.Api/Entities/)
- `Education` - Education history
- `WorkExperience` - Work experience history
- `Skill` - Skills list
- `ResumeContent` - Headline and about me

### Handlers (NexApply.Api/Features/Profile/)
Each slice has:
- Handler (business logic)
- Validator (FluentValidation)
- Endpoint (Minimal API)

---

## Database Changes Required

Run migration to add new tables:
```bash
dotnet ef migrations add AddProfileEntities --project NexApply.Api
dotnet ef database update --project NexApply.Api
```

New tables:
- `Educations`
- `WorkExperiences`
- `Skills`
- `ResumeContents`

---

## Testing

All endpoints require JWT Bearer token in Authorization header.

Example:
```
Authorization: Bearer <token>
```

Use Swagger UI at `/swagger` for testing.
