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