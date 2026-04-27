import { useLocation, Link } from 'react-router-dom';
import './CompanySidebar.css';

export function CompanySidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="rec-sidebar" aria-label="Recruiter navigation">
      {/* Brand */}
      <div className="rec-brand">
        <div className="rec-brand-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" fill="#1D4ED8"/>
            <path d="M10 10V18M10 10L18 18M18 18V10" stroke="white" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="rec-brand-name">NexApply</span>
        <span className="rec-brand-pill">Recruiter</span>
      </div>

      {/* Company Card */}
      <div className="rec-company-card">
        <div className="rec-company-avatar" aria-label="CodeBridge Co. logo">
          <span>CB</span>
        </div>
        <div className="rec-company-meta">
          <span className="rec-company-name">CodeBridge Co.</span>
          <span className="rec-company-role">Hiring Manager</span>
        </div>
        <button className="rec-company-chevron" title="Company settings" aria-label="Open company settings">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="rec-nav" aria-label="Recruiter menu">
        <p className="rec-nav-label">Manage</p>

        <Link 
          to="/company-dashboard" 
          className={`rec-nav-item ${isActive('/company-dashboard') ? 'is-active' : ''}`}
          aria-current={isActive('/company-dashboard') ? 'page' : undefined}
        >
          <span className="rec-nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </span>
          Dashboard
        </Link>

        <Link 
          to="/company-post-job" 
          className={`rec-nav-item ${isActive('/recruiter/post-job') ? 'is-active' : ''}`}
        >
          <span className="rec-nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          Post a Job
          <span className="rec-nav-badge-blue" aria-label="New feature">New</span>
        </Link>

        <Link 
          to="/company-manage-jobs" 
          className={`rec-nav-item ${isActive('/recruiter/manage-jobs') ? 'is-active' : ''}`}
        >
          <span className="rec-nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          Manage Jobs
          <span className="rec-nav-count" aria-label="4 active jobs">4</span>
        </Link>

        <Link 
          to="/company-applicants" 
          className={`rec-nav-item ${isActive('/company-applicants') ? 'is-active' : ''}`}
        >
          <span className="rec-nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          Applicants
          <span className="rec-nav-count rec-nav-count--alert" aria-label="12 applicants">12</span>
        </Link>

        <Link 
          to="/company-interviews" 
          className={`rec-nav-item ${isActive('/company-interviews') ? 'is-active' : ''}`}
        >
          <span className="rec-nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </span>
          Interviews
          <span className="rec-nav-dot" aria-label="Upcoming interviews indicator"></span>
        </Link>

        <p className="rec-nav-label" style={{ marginTop: '1.25rem' }}>Communication</p>

        <Link 
          to="/company-messages" 
          className={`rec-nav-item ${isActive('/company-messages') ? 'is-active' : ''}`}
        >
          <span className="rec-nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          Messages
          <span className="rec-nav-count" aria-label="3 unread messages">3</span>
        </Link>

        <p className="rec-nav-label" style={{ marginTop: '1.25rem' }}>Account</p>

        <Link 
          to="/company-profile" 
          className={`rec-nav-item ${isActive('/company-profile') ? 'is-active' : ''}`}
        >
          <span className="rec-nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          Company Profile
        </Link>
      </nav>

      {/* Footer */}
      <div className="rec-sidebar-footer">
        <Link to="/company/settings" className="rec-nav-item">
          <span className="rec-nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
                    stroke="currentColor" strokeWidth="2"/>
            </svg>
          </span>
          Settings
        </Link>

        <Link to="/logout" className="rec-nav-item rec-nav-item--logout">
          <span className="rec-nav-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          Log Out
        </Link>
      </div>
    </aside>
  );
}
