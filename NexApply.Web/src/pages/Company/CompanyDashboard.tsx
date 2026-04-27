import { Link } from 'react-router-dom';
import {CompanySidebar} from '../../components/CompanySidebar';
import {CompanyHeader} from '../../components/CompanyHeader';
import './CompanyDashboard.css';

// ── Types ────────────────────────────────────────────────

interface Applicant {
  initials: string;
  name: string;
  role: string;
  statusLabel: string;
  statusModifier: 'submitted' | 'review' | 'shortlisted' | 'interview' | 'declined';
  date: string;
}

interface JobListing {
  title: string;
  typeLabel: string;
  typeModifier: 'blue' | 'green';
  locationLabel: string;
  applicantCount: number;
  postedDate: string;
}

// ── Static data ──────────────────────────────────────────

const RECENT_APPLICANTS: Applicant[] = [
  { initials: 'KR', name: 'Kira Reyes',      role: 'Full-Stack Developer Intern', statusLabel: 'Under Review', statusModifier: 'review',      date: 'Apr 9' },
  { initials: 'MG', name: 'Marco Guerrero',  role: 'React Frontend Developer',    statusLabel: 'Shortlisted',  statusModifier: 'shortlisted', date: 'Apr 8' },
  { initials: 'SC', name: 'Sofia Cruz',      role: 'API Developer (.NET)',         statusLabel: 'For Interview',statusModifier: 'interview',   date: 'Apr 7' },
  { initials: 'JT', name: 'James Tan',       role: '.NET Core Developer',          statusLabel: 'Submitted',    statusModifier: 'submitted',   date: 'Apr 7' },
];

const ACTIVE_LISTINGS: JobListing[] = [
  { title: 'Full-Stack Developer Intern', typeLabel: 'Internship', typeModifier: 'blue',  locationLabel: 'Remote',  applicantCount: 14, postedDate: 'Apr 7' },
  { title: 'React Frontend Developer',    typeLabel: 'Internship', typeModifier: 'blue',  locationLabel: 'Remote',  applicantCount: 9,  postedDate: 'Apr 3' },
  { title: 'API Developer (.NET)',         typeLabel: 'Full-time',  typeModifier: 'green', locationLabel: 'Hybrid',  applicantCount: 21, postedDate: 'Apr 2' },
  { title: '.NET Core Developer',         typeLabel: 'Full-time',  typeModifier: 'green', locationLabel: 'On-site', applicantCount: 43, postedDate: 'Apr 4' },
];

// ── Sub-components ───────────────────────────────────────

/** SVG icon — plus inside a circle */
const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** SVG icon — group of people */
const IconPeople = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** SVG icon — calendar */
const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** SVG icon — chat bubble */
const IconMessage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

/** Small person icon used inside listing stat */
const IconPersonSm = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// ── Main component ───────────────────────────────────────

const RecruiterDashboard: React.FC = () => {
  return (
    <div className="rec-shell">
      <CompanySidebar />

      <div className="rec-main">
        <CompanyHeader
          title="Dashboard"
          subtitle="Manage your job postings and applicants"
        />

        {/* Body */}
        <main className="rec-body" id="main-content">

          {/* ── Quick Actions Grid ── */}
          <div className="rec-actions-grid">

            <Link to="/company-post-job" className="rec-action-card rec-action-card--primary" role="button">
              <span className="rec-action-icon" aria-hidden="true"><IconPlus /></span>
              <span className="rec-action-label">Post a New Job</span>
              <span className="rec-action-sub">Create a new listing</span>
            </Link>

            <Link to="/company-applicants" className="rec-action-card" role="button">
              <span className="rec-action-icon" aria-hidden="true"><IconPeople /></span>
              <span className="rec-action-label">Review Applicants</span>
              <span className="rec-action-sub">12 awaiting review</span>
            </Link>

            <Link to="/company-interviews" className="rec-action-card" role="button">
              <span className="rec-action-icon" aria-hidden="true"><IconCalendar /></span>
              <span className="rec-action-label">Schedule Interview</span>
              <span className="rec-action-sub">6 upcoming</span>
            </Link>

            <Link to="/company-messages" className="rec-action-card" role="button">
              <span className="rec-action-icon" aria-hidden="true"><IconMessage /></span>
              <span className="rec-action-label">Messages</span>
              <span className="rec-action-sub">3 unread</span>
            </Link>

          </div>

          {/* ── Lower Grid: Recent Applicants + Active Listings ── */}
          <div className="rec-lower-grid">

            {/* Recent Applicants */}
            <section className="rec-panel" aria-labelledby="recent-applicants-heading">
              <div className="rec-panel-header">
                <h2 className="rec-section-title" id="recent-applicants-heading">Recent Applicants</h2>
                <Link to="/recruiter/applicants" className="rec-panel-link">View all</Link>
              </div>

              <ul className="rec-applicant-list" role="list">
                {RECENT_APPLICANTS.map((applicant) => (
                  <li key={applicant.name} className="rec-applicant-row">
                    <div className="rec-applicant-avatar" aria-hidden="true">
                      {applicant.initials}
                    </div>
                    <div className="rec-applicant-info">
                      <span className="rec-applicant-name">{applicant.name}</span>
                      <span className="rec-applicant-role">{applicant.role}</span>
                    </div>
                    <span className={`rec-status-badge rec-status-badge--${applicant.statusModifier}`}>
                      {applicant.statusLabel}
                    </span>
                    <span className="rec-applicant-date">{applicant.date}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Active Job Listings */}
            <section className="rec-panel" aria-labelledby="active-listings-heading">
              <div className="rec-panel-header">
                <h2 className="rec-section-title" id="active-listings-heading">Active Listings</h2>
                <Link to="/recruiter/manage-jobs" className="rec-panel-link">Manage all</Link>
              </div>

              <ul className="rec-listing-list" role="list">
                {ACTIVE_LISTINGS.map((job) => (
                  <li key={job.title} className="rec-listing-row">
                    <div className="rec-listing-info">
                      <span className="rec-listing-title">{job.title}</span>
                      <div className="rec-listing-meta">
                        <span className={`rec-tag rec-tag--${job.typeModifier}`}>{job.typeLabel}</span>
                        <span className="rec-tag rec-tag--slate">{job.locationLabel}</span>
                      </div>
                    </div>
                    <div className="rec-listing-stats">
                      <span className="rec-listing-stat">
                        <IconPersonSm />
                        <span>{job.applicantCount}</span>
                      </span>
                      <span className="rec-listing-date">Posted {job.postedDate}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
