import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {CompanySidebar} from '../../components/CompanySidebar';
import {CompanyHeader} from '../../components/CompanyHeader';
import { companyDashboardService, type CompanyDashboardDto } from '../../services/companyDashboardService';
import './CompanyDashboard.css';

// ── Helpers ──────────────────────────────────────────────

const getStatusModifier = (status: string): 'submitted' | 'review' | 'shortlisted' | 'interview' | 'declined' => {
  const key = status.replace(/\s+/g, '');
  const statusMap: Record<string, 'submitted' | 'review' | 'shortlisted' | 'interview' | 'declined'> = {
    Submitted: 'submitted',
    UnderReview: 'review',
    Shortlisted: 'shortlisted',
    Interview: 'interview',
    ForInterview: 'interview',
    Declined: 'declined'
  };
  return statusMap[key] || 'submitted';
};

const getTypeModifier = (jobType: string): 'blue' | 'green' => {
  return jobType === 'Internship' ? 'blue' : 'green';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

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
  const [dashboard, setDashboard] = useState<CompanyDashboardDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      setError(null);
      const result = await companyDashboardService.getDashboard();
      
      if (result.isSuccess && result.value) {
        setDashboard(result.value);
      } else {
        setError(result.error || 'Failed to load dashboard');
      }
      
      setIsLoading(false);
    };

    fetchDashboard();
  }, []);

  return (
    <div className="rec-shell">
      <CompanySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="rec-main">
        <CompanyHeader
          title="Dashboard"
          subtitle="Manage your job postings and applicants"
          onMenuToggle={() => setIsSidebarOpen((value) => !value)}
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
              <span className="rec-action-sub">{dashboard?.awaitingReview || 0} awaiting review</span>
            </Link>

            <Link to="/company-interviews" className="rec-action-card" role="button">
              <span className="rec-action-icon" aria-hidden="true"><IconCalendar /></span>
              <span className="rec-action-label">Schedule Interview</span>
              <span className="rec-action-sub">{dashboard?.upcomingInterviews || 0} upcoming</span>
            </Link>

            <Link to="/company-messages" className="rec-action-card" role="button">
              <span className="rec-action-icon" aria-hidden="true"><IconMessage /></span>
              <span className="rec-action-label">Messages</span>
              <span className="rec-action-sub">{dashboard?.unreadMessages || 0} unread</span>
            </Link>

          </div>

          {/* ── Lower Grid: Recent Applicants + Active Listings ── */}
          <div className="rec-lower-grid">

            {/* Recent Applicants */}
            <section className="rec-panel" aria-labelledby="recent-applicants-heading">
              <div className="rec-panel-header">
                <h2 className="rec-section-title" id="recent-applicants-heading">Recent Applicants</h2>
                <Link to="/company-applicants" className="rec-panel-link">View all</Link>
              </div>

              {isLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>Loading...</div>
              ) : error ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#DC2626' }}>{error}</div>
              ) : !dashboard?.recentApplicants || dashboard.recentApplicants.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
                  <div style={{ fontSize: '14px' }}>No Recent Applications</div>
                </div>
              ) : (
                <ul className="rec-applicant-list" role="list">
                  {dashboard.recentApplicants.map((applicant) => (
                    <li key={applicant.applicationId} className="rec-applicant-row">
                      <div className="rec-applicant-avatar" aria-hidden="true">
                        {getInitials(applicant.studentName)}
                      </div>
                      <div className="rec-applicant-info">
                        <span className="rec-applicant-name">{applicant.studentName}</span>
                        <span className="rec-applicant-role">{applicant.jobTitle}</span>
                      </div>
                      <div className="rec-applicant-meta">
                        <span className={`rec-status-badge rec-status-badge--${getStatusModifier(applicant.status)}`}>
                          {applicant.status}
                        </span>
                        <span className="rec-applicant-date">{formatDate(applicant.appliedAt)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Active Job Listings */}
            <section className="rec-panel" aria-labelledby="active-listings-heading">
              <div className="rec-panel-header">
                <h2 className="rec-section-title" id="active-listings-heading">Active Listings</h2>
                <Link to="/company-manage-jobs" className="rec-panel-link">Manage all</Link>
              </div>

              {isLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>Loading...</div>
              ) : error ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#DC2626' }}>{error}</div>
              ) : !dashboard?.activeListings || dashboard.activeListings.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
                  <div style={{ fontSize: '14px' }}>No Active Listings</div>
                </div>
              ) : (
                <ul className="rec-listing-list" role="list">
                  {dashboard.activeListings.map((job) => (
                    <li key={job.jobListingId} className="rec-listing-row">
                      <div className="rec-listing-info">
                        <span className="rec-listing-title">{job.title}</span>
                        <div className="rec-listing-meta">
                          <span className={`rec-tag rec-tag--${getTypeModifier(job.jobType)}`}>{job.jobType}</span>
                          <span className="rec-tag rec-tag--slate">{job.workSetup}</span>
                        </div>
                      </div>
                      <div className="rec-listing-stats">
                        <span className="rec-listing-stat">
                          <IconPersonSm />
                          <span>{job.applicantCount}</span>
                        </span>
                        <span className="rec-listing-date">Posted {formatDate(job.postedAt)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

          </div>
        </main>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
