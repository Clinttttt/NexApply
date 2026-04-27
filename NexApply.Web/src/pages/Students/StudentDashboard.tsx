import { Link } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { PageHeader } from '../../components/PageHeader';
import './StudentDashboard.css';

export function Dashboard() {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <PageHeader title="Dashboard" subtitle="Welcome back, Clint — here's your job hunt at a glance.">
          <div className="search-wrap">
            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input className="search-input" type="text" placeholder="Search jobs, companies…" />
          </div>
          <button className="notif-btn" aria-label="Notifications">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="notif-indicator"></span>
          </button>
        </PageHeader>

        <div className="page-body">
          {/* Activity Banner */}
          <div className="activity-banner">
            {/* Left: Pipeline numbers */}
            <div className="banner-pipeline">
              <div className="bp-item">
                <span className="bp-num">3</span>
                <span className="bp-label">Applied</span>
              </div>
              <div className="bp-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className="bp-item">
                <span className="bp-num bp-num--amber">1</span>
                <span className="bp-label">Under Review</span>
              </div>
              <div className="bp-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className="bp-item">
                <span className="bp-num bp-num--green">1</span>
                <span className="bp-label">Shortlisted</span>
              </div>
              <div className="bp-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className="bp-item bp-item--dim">
                <span className="bp-num bp-num--dim">0</span>
                <span className="bp-label">Interview</span>
              </div>
            </div>

            <div className="banner-divider"></div>

            {/* Right: Match highlight + quick CTA */}
            <div className="banner-right">
              <div className="banner-match">
                <div className="banner-match-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div>
                  <span className="banner-match-count">12 new matches</span>
                  <span className="banner-match-sub">based on your resume</span>
                </div>
              </div>
              <Link to="/browse-jobs" className="banner-cta">
                Browse Jobs
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Lower Grid */}
          <div className="lower-grid">
            {/* COLUMN LEFT: Recent Applications */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-left">
                  <h2 className="panel-title">Recent Applications</h2>
                  <span className="panel-badge">3</span>
                </div>
                <Link to="/my-applications" className="panel-link">View all →</Link>
              </div>

              <div className="app-list">
                <Link to="#" className="app-item">
                  <div className="app-stage-bar app-stage-bar--amber"></div>
                  <div className="app-logo app-logo--blue">SF</div>
                  <div className="app-detail">
                    <span className="app-title">Frontend Developer Intern</span>
                    <span className="app-meta">SoftForge Inc. · Remote</span>
                  </div>
                  <div className="app-right">
                    <span className="app-status app-status--amber">Under Review</span>
                    <span className="app-date">Apr 5</span>
                  </div>
                </Link>

                <Link to="#" className="app-item">
                  <div className="app-stage-bar app-stage-bar--slate"></div>
                  <div className="app-logo app-logo--slate">TP</div>
                  <div className="app-detail">
                    <span className="app-title">Junior .NET Developer</span>
                    <span className="app-meta">TechSpark PH · On-site</span>
                  </div>
                  <div className="app-right">
                    <span className="app-status app-status--slate">Submitted</span>
                    <span className="app-date">Apr 3</span>
                  </div>
                </Link>

                <Link to="#" className="app-item app-item--featured">
                  <div className="app-stage-bar app-stage-bar--green"></div>
                  <div className="app-logo app-logo--green">NT</div>
                  <div className="app-detail">
                    <span className="app-title">Backend Intern</span>
                    <span className="app-meta">NexaTech Solutions · Hybrid</span>
                  </div>
                  <div className="app-right">
                    <span className="app-status app-status--green">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                           fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Shortlisted
                    </span>
                    <span className="app-date">Mar 28</span>
                  </div>
                </Link>
              </div>

              {/* Timeline hint */}
              <div className="app-timeline-hint">
                <div className="timeline-track">
                  <div className="timeline-seg timeline-seg--filled" title="Applied"></div>
                  <div className="timeline-seg timeline-seg--filled timeline-seg--amber" title="Under Review"></div>
                  <div className="timeline-seg timeline-seg--filled timeline-seg--green" title="Shortlisted"></div>
                  <div className="timeline-seg" title="Interview"></div>
                  <div className="timeline-seg" title="Offer"></div>
                </div>
                <span className="timeline-label">1 of 5 stages reached · Backend Intern</span>
              </div>
            </div>

            {/* COLUMN RIGHT: Top Matches */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-left">
                  <h2 className="panel-title">Top Job Matches</h2>
                  <span className="panel-badge">12</span>
                </div>
                <Link to="/browse-jobs" className="panel-link">See all →</Link>
              </div>

              <div className="match-list">
                <Link to="#" className="match-item">
                  <div className="match-score-ring match-score-ring--high">
                    <svg viewBox="0 0 36 36" className="ring-svg">
                      <circle className="ring-bg" cx="18" cy="18" r="15.5" />
                      <circle className="ring-fill ring-fill--high" cx="18" cy="18" r="15.5"
                              strokeDasharray="88.6 100" />
                    </svg>
                    <span className="ring-value">91</span>
                  </div>
                  <div className="match-body">
                    <div className="match-top-row">
                      <div>
                        <span className="match-title">Full-Stack Developer Intern</span>
                        <span className="match-company">CodeBridge Co. · Makati</span>
                      </div>
                      <span className="match-type-badge">Full-time</span>
                    </div>
                    <div className="match-skills">
                      <span className="skill-tag">React</span>
                      <span className="skill-tag">C#</span>
                      <span className="skill-tag">ASP.NET</span>
                    </div>
                  </div>
                  <svg className="match-arrow" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>

                <Link to="#" className="match-item">
                  <div className="match-score-ring match-score-ring--mid">
                    <svg viewBox="0 0 36 36" className="ring-svg">
                      <circle className="ring-bg" cx="18" cy="18" r="15.5" />
                      <circle className="ring-fill ring-fill--mid" cx="18" cy="18" r="15.5"
                              strokeDasharray="81.8 100" />
                    </svg>
                    <span className="ring-value">84</span>
                  </div>
                  <div className="match-body">
                    <div className="match-top-row">
                      <div>
                        <span className="match-title">C# Backend Intern</span>
                        <span className="match-company">SkyNet Systems · BGC</span>
                      </div>
                      <span className="match-type-badge match-type-badge--intern">Internship</span>
                    </div>
                    <div className="match-skills">
                      <span className="skill-tag">.NET</span>
                      <span className="skill-tag">SQL</span>
                      <span className="skill-tag">Docker</span>
                    </div>
                  </div>
                  <svg className="match-arrow" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>

                <Link to="#" className="match-item">
                  <div className="match-score-ring match-score-ring--fair">
                    <svg viewBox="0 0 36 36" className="ring-svg">
                      <circle className="ring-bg" cx="18" cy="18" r="15.5" />
                      <circle className="ring-fill ring-fill--fair" cx="18" cy="18" r="15.5"
                              strokeDasharray="75.0 100" />
                    </svg>
                    <span className="ring-value">77</span>
                  </div>
                  <div className="match-body">
                    <div className="match-top-row">
                      <div>
                        <span className="match-title">Junior Software Engineer</span>
                        <span className="match-company">Luminary Labs · Remote</span>
                      </div>
                      <span className="match-type-badge match-type-badge--remote">Remote</span>
                    </div>
                    <div className="match-skills">
                      <span className="skill-tag">Blazor</span>
                      <span className="skill-tag">PostgreSQL</span>
                      <span className="skill-tag">Azure</span>
                    </div>
                  </div>
                  <svg className="match-arrow" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Row: Resume Strength + Quick Actions */}
          <div className="bottom-row">
            {/* Resume Strength */}
            <div className="panel panel--compact">
              <div className="panel-header">
                <div className="panel-header-left">
                  <h2 className="panel-title">Resume Strength</h2>
                </div>
                <Link to="/resume" className="panel-link">Edit →</Link>
              </div>
              <div className="resume-strength-body">
                <div className="rs-arc-wrap">
                  <svg viewBox="0 0 100 60" className="rs-arc-svg">
                    <path className="rs-arc-bg"
                          d="M 10 55 A 40 40 0 0 1 90 55"
                          fill="none" strokeWidth="8" strokeLinecap="round" />
                    <path className="rs-arc-fill"
                          d="M 10 55 A 40 40 0 0 1 90 55"
                          fill="none" strokeWidth="8" strokeLinecap="round"
                          strokeDasharray="125" strokeDashoffset="37" />
                  </svg>
                  <div className="rs-arc-label">
                    <span className="rs-value">72</span>
                    <span className="rs-unit">/ 100</span>
                  </div>
                </div>
                <div className="rs-checklist">
                  <div className="rs-item rs-item--done">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Work Experience
                  </div>
                  <div className="rs-item rs-item--done">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Skills Listed
                  </div>
                  <div className="rs-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Add a portfolio link
                  </div>
                  <div className="rs-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Upload latest resume
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="panel panel--compact quick-actions-panel">
              <div className="panel-header">
                <h2 className="panel-title">Quick Actions</h2>
              </div>
              <div className="quick-actions">
                <Link to="/browse-jobs" className="qa-item qa-item--primary">
                  <div className="qa-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <div className="qa-text">
                    <span className="qa-title">Browse Jobs</span>
                    <span className="qa-sub">24 new listings today</span>
                  </div>
                  <svg className="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
                <Link to="/my-applications" className="qa-item">
                  <div className="qa-icon qa-icon--slate">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="qa-text">
                    <span className="qa-title">Track Applications</span>
                    <span className="qa-sub">1 awaiting update</span>
                  </div>
                  <svg className="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
                <Link to="/resume" className="qa-item">
                  <div className="qa-icon qa-icon--slate">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="qa-text">
                    <span className="qa-title">Update Resume</span>
                    <span className="qa-sub">Boost your match score</span>
                  </div>
                  <svg className="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
