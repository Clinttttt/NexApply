# NexApply — Job & Internship Portal

NexApply is a two-sided job and internship portal. Companies post listings and manage applicants, students browse and apply.

## Roles
- **Company** — post and manage own listings, view applicants
- **Student** — browse listings, apply, upload resume, view match score

## Core Features
- **Auth** — login, register, refresh token, Google OAuth login
- **Job Listings** — create, edit, delete (companies post directly, no approval needed)
- **Applications** — apply to listings, track status (Submitted → Under Review → Shortlisted → For Interview → Declined)
- **Resume Upload** — upload PDF or DOCX resume (max 5MB), parsed and stored as text
- **Resume Matching** — PostgreSQL full-text search ranks listings against student resume, no AI
- **Search & Filter** — filter listings by keyword, job type, location

## Job Types
FullTime, PartTime, Internship, Freelance, Remote

---

## Client (Blazor Server)

### Student Pages
- **Dashboard (Menu)** — stats overview, recent applications, top job matches with resume score
- **Browse Jobs** — 3-column layout (filters, job list, detail panel), skill picker, resume matching, save jobs
- **My Applications** — track application status with pipeline visualization, filter by stage/type
- **Resume & Profile** — upload resume (PDF/DOCX/image) or build from scratch, profile strength tracker
- **Saved Jobs** — manage bookmarked listings, filter by type/setup, quick apply
- **Notifications** — (placeholder)

### Recruiter Pages
- **Dashboard** — quick actions, recent applicants, active listings overview
- **Post Job** — 4-step wizard (basic info, description, requirements, review), completeness tracker
- **Manage Jobs** — view/edit/pause/close listings, applicant breakdown, status filters
- **Applicants** — review candidates, stage management (Submitted → Under Review → Shortlisted → For Interview → Declined), resume viewer, bulk actions, schedule interviews
- **Interviews** — (placeholder)
- **Messages** — (placeholder)
- **Company Profile** — (placeholder)

### Shared Components
- **Sidebar** — student navigation (Dashboard, Browse Jobs, Applications, Saved Jobs, Profile)
- **RecruiterSidebar** — recruiter navigation (Dashboard, Post Job, Manage Jobs, Applicants, Interviews, Messages, Profile)
- **PageHeader** — consistent page titles with actions
- **ResumeDocument** — editable resume builder component