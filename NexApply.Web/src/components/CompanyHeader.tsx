import './CompanyHeader.css';

interface CompanyHeaderProps {
  title: string;
  subtitle?: string;
}

export function CompanyHeader({ title, subtitle }: CompanyHeaderProps) {
  return (
    <header className="rec-header" role="banner">
      <div className="rec-header-left">
        <h1 className="rec-page-title">
          {title}
          {subtitle && <span className="rec-page-subtitle">{subtitle}</span>}
        </h1>
      </div>
      <div className="rec-header-right">
        <div className="rec-search-wrap" role="search">
          <span className="rec-search-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <input 
            type="search" 
            className="rec-search-input"
            placeholder="Search applicants, jobs…"
            aria-label="Search applicants and jobs"
          />
        </div>
        <button className="rec-icon-btn" title="Notifications" aria-label="Notifications — 2 unread">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="rec-notif-dot" aria-hidden="true"></span>
        </button>
        <div className="rec-header-avatar" aria-label="Alex — Hiring Manager">AV</div>
      </div>
    </header>
  );
}
