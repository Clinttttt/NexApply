# NexApply — Job & Internship Portal

NexApply is a two-sided job and internship portal. Companies post listings and manage applicants, students browse and apply, and an admin moderates everything.

## Roles
- **Admin** — full control, approves/rejects listings, manages users
- **Company** — post and manage own listings, view applicants
- **Student** — browse listings, apply, upload resume, view match score
- **Public** — browse approved listings only, no account required

## Core Features
- **Auth** — login, register, refresh token, Google OAuth login
- **Job Listings** — create, edit, delete, approval workflow (Pending → Approved / Rejected)
- **Applications** — apply to listings, track status (Submitted → Under Review → Shortlisted → For Interview → Declined)
- **Resume Upload** — upload PDF or DOCX resume (max 5MB), parsed and stored as text
- **Resume Matching** — PostgreSQL full-text search ranks listings against student resume, no AI
- **Admin Dashboard** — stat cards, moderation queue, user management
- **Search & Filter** — filter listings by keyword, job type, location

## Job Types
FullTime, PartTime, Internship, Freelance, Remote