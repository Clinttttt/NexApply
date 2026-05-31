import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { PageHeader } from '../../components/PageHeader';
import {
  studentDashboardService,
  type StudentDashboardApplicationDto,
  type StudentDashboardDto,
  type StudentDashboardJobMatchDto
} from '../../services/studentDashboardService';
import './StudentDashboard.css';

const emptyDashboard: StudentDashboardDto = {
  studentName: 'Student',
  appliedCount: 0,
  underReviewCount: 0,
  shortlistedCount: 0,
  interviewCount: 0,
  newMatchesCount: 0,
  newListingsTodayCount: 0,
  awaitingUpdateCount: 0,
  resumeStrength: {
    score: 0,
    hasWorkExperience: false,
    hasSkills: false,
    hasPortfolio: false,
    hasLatestResume: false
  },
  recentApplications: [],
  topJobMatches: []
};

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));

const getFirstName = (fullName: string) => fullName.trim().split(/\s+/)[0] || 'there';

const getStatusClass = (status: string) => {
  if (status === 'Shortlisted') return 'app-status--green';
  if (status === 'Under Review') return 'app-status--amber';
  if (status === 'Decided') return 'app-status--green';
  return 'app-status--slate';
};

const getStageClass = (status: string) => {
  if (status === 'Shortlisted') return 'app-stage-bar--green';
  if (status === 'Under Review') return 'app-stage-bar--amber';
  if (status === 'Decided') return 'app-stage-bar--green';
  return 'app-stage-bar--slate';
};

const getLogoClass = (index: number, status?: string) => {
  if (status === 'Shortlisted') return 'app-logo--green';
  if (status === 'Under Review') return 'app-logo--blue';
  if (status === 'Decided') return 'app-logo--green';
  return index % 2 === 0 ? 'app-logo--slate' : 'app-logo--blue';
};

const getRingClass = (score: number) => {
  if (score >= 90) return 'high';
  if (score >= 80) return 'mid';
  return 'fair';
};

const getResumeStrengthMeta = (score: number) => {
  if (score >= 90) return { label: 'Excellent', tone: 'excellent' as const, caption: 'Ready to apply to top matches.' };
  if (score >= 75) return { label: 'Strong', tone: 'strong' as const, caption: 'A few tweaks can boost your match score.' };
  if (score >= 55) return { label: 'Improving', tone: 'improving' as const, caption: 'Add details to unlock better recommendations.' };
  return { label: 'Needs work', tone: 'needs-work' as const, caption: 'Strengthen your profile.' };
};

const getMatchBadgeClass = (match: StudentDashboardJobMatchDto) => {
  if (match.jobType === 'Internship') return 'match-type-badge--intern';
  if (match.workSetup === 'Remote') return 'match-type-badge--remote';
  return '';
};

const getTimelineStage = (applications: StudentDashboardApplicationDto[]) => {
  const featured = applications.find(application => application.status === 'Decided')
    ?? applications.find(application => application.status === 'Shortlisted')
    ?? applications.find(application => application.status === 'Under Review')
    ?? applications[0];

  if (!featured) {
    return { reached: 0, label: 'No applications yet' };
  }

  const stageMap: Record<string, number> = {
    Submitted: 1,
    'Under Review': 2,
    Shortlisted: 3,
    Interview: 4,
    Decided: 5,
    Declined: 1
  };

  const stageName = featured.status === 'Declined' ? 'Application Declined' : featured.status;

  return {
    reached: stageMap[featured.status] ?? 1,
    label: `${stageName} - ${featured.title}`
  };
};

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="dashboard-state">
      <svg className="dashboard-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
      {label}
    </div>
  );
}

function EmptyPanel({ label }: { label: string }) {
  return <div className="dashboard-state dashboard-state--empty">{label}</div>;
}

export function Dashboard() {
  const [dashboard, setDashboard] = useState<StudentDashboardDto>(emptyDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setLoadError(null);

      const result = await studentDashboardService.getDashboard();

      if (result.isSuccess && result.value) {
        setDashboard(result.value);
      } else {
        setLoadError(result.error || 'Failed to load dashboard');
      }

      setIsLoading(false);
    };

    loadDashboard();
  }, []);

  const visibleMatches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return dashboard.topJobMatches;

    return dashboard.topJobMatches.filter(match =>
      match.title.toLowerCase().includes(query)
      || match.company.toLowerCase().includes(query)
      || match.matchedSkills.some(skill => skill.toLowerCase().includes(query))
    );
  }, [dashboard.topJobMatches, searchQuery]);

  const timeline = getTimelineStage(dashboard.recentApplications);
  const resumeOffset = 125 - (125 * Math.min(dashboard.resumeStrength.score, 100) / 100);
  const resumeScore = Math.min(dashboard.resumeStrength.score, 100);
  const resumeMeta = getResumeStrengthMeta(resumeScore);
  const hasNotification = dashboard.awaitingUpdateCount > 0;

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="main-content">
        <PageHeader
          title="Dashboard"
          subtitle={`Welcome back, ${getFirstName(dashboard.studentName)} - here's your job hunt at a glance.`}
          onMenuToggle={() => setIsSidebarOpen((value) => !value)}
        >
          <div className="search-wrap">
            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search jobs, companies..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <Link to="/notifications" className="notif-btn" aria-label="Notifications">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {hasNotification && <span className="notif-indicator"></span>}
          </Link>
        </PageHeader>

        <div className="page-body">
          {loadError && (
            <div className="dashboard-error">
              <span>{loadError}</span>
              <button type="button" onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}

          <div className="activity-banner">
            <div className="banner-pipeline">
              <div className="bp-item">
                <span className="bp-num">{dashboard.appliedCount}</span>
                <span className="bp-label">Applied</span>
              </div>
              <div className="bp-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className="bp-item">
                <span className="bp-num bp-num--amber">{dashboard.underReviewCount}</span>
                <span className="bp-label">Under Review</span>
              </div>
              <div className="bp-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className="bp-item">
                <span className="bp-num bp-num--green">{dashboard.shortlistedCount}</span>
                <span className="bp-label">Shortlisted</span>
              </div>
              <div className="bp-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className={`bp-item ${dashboard.interviewCount === 0 ? 'bp-item--dim' : ''}`}>
                <span className={`bp-num ${dashboard.interviewCount === 0 ? 'bp-num--dim' : 'bp-num--green'}`}>{dashboard.interviewCount}</span>
                <span className="bp-label">Interview</span>
              </div>
            </div>

            <div className="banner-divider"></div>

            <div className="banner-right">
              <div className="banner-match">
                <div className="banner-match-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div>
                  <span className="banner-match-count">{dashboard.newMatchesCount} new matches</span>
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

          <div className="lower-grid">
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-left">
                  <h2 className="panel-title">Recent Applications</h2>
                  <span className="panel-badge">{dashboard.recentApplications.length}</span>
                </div>
                <Link to="/my-applications" className="panel-link">View all {'->'}</Link>
              </div>

              {isLoading ? (
                <LoadingPanel label="Loading applications..." />
              ) : dashboard.recentApplications.length === 0 ? (
                <EmptyPanel label="No applications yet. Start by browsing jobs that match your resume." />
              ) : (
                <>
                  <div className="app-list">
                    {dashboard.recentApplications.map((application, index) => (
                      <Link
                        key={application.applicationId}
                        to="/my-applications"
                        className={`app-item ${application.status === 'Shortlisted' ? 'app-item--featured' : ''}`}
                      >
                        <div className={`app-stage-bar ${getStageClass(application.status)}`}></div>
                        <div className={`app-logo ${getLogoClass(index, application.status)}`}>{application.logoText}</div>
                        <div className="app-detail">
                          <span className="app-title">{application.title}</span>
                          <span className="app-meta">{application.company} - {application.workSetup}</span>
                        </div>
                        <div className="app-right">
                          <span className={`app-status ${getStatusClass(application.status)}`}>
                            {application.status === 'Shortlisted' && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                                   fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                            {application.status}
                          </span>
                          <span className="app-date">{formatShortDate(application.appliedAt)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="app-timeline-hint">
                    <div className="timeline-track">
                      {[1, 2, 3, 4, 5].map(stage => (
                        <div
                          key={stage}
                          className={`timeline-seg ${stage <= timeline.reached ? 'timeline-seg--filled' : ''} ${stage === 2 && stage <= timeline.reached ? 'timeline-seg--amber' : ''} ${(stage === 3 || stage === 4 || stage === 5) && stage <= timeline.reached ? 'timeline-seg--green' : ''}`}
                        ></div>
                      ))}
                    </div>
                    <span className="timeline-label">{timeline.label}</span>
                  </div>
                </>
              )}
            </div>

            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-left">
                  <h2 className="panel-title">Top Job Matches</h2>
                  <span className="panel-badge">{dashboard.newMatchesCount}</span>
                </div>
                <Link to="/browse-jobs" className="panel-link">See all {'->'}</Link>
              </div>

              {isLoading ? (
                <LoadingPanel label="Finding matches..." />
              ) : visibleMatches.length === 0 ? (
                <EmptyPanel label={searchQuery ? 'No matches found for that search.' : 'No matches yet. Update your resume to improve recommendations.'} />
              ) : (
                <div className="match-list">
                  {visibleMatches.map(match => {
                    const ringClass = getRingClass(match.matchScore);
                    const badgeClass = getMatchBadgeClass(match);

                    return (
                      <Link key={match.jobListingId} to="/browse-jobs" className="match-item">
                        <div className={`match-score-ring match-score-ring--${ringClass}`}>
                          <svg viewBox="0 0 36 36" className="ring-svg">
                            <circle className="ring-bg" cx="18" cy="18" r="15.5" />
                            <circle className={`ring-fill ring-fill--${ringClass}`} cx="18" cy="18" r="15.5"
                                    strokeDasharray={`${Math.max(match.matchScore, 4)} 100`} />
                          </svg>
                          <span className="ring-value">{match.matchScore}</span>
                        </div>
                        <div className="match-body">
                          <div className="match-top-row">
                            <div>
                              <span className="match-title">{match.title}</span>
                              <span className="match-company">{match.company} - {match.workSetup}</span>
                            </div>
                            <span className={`match-type-badge ${badgeClass}`}>{match.jobType}</span>
                          </div>
                          <div className="match-skills">
                            {match.matchedSkills.slice(0, 3).map(skill => (
                              <span key={skill} className="skill-tag">{skill}</span>
                            ))}
                          </div>
                        </div>
                        <svg className="match-arrow" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bottom-row">
            <div className="panel panel--compact">
              <div className="panel-header">
                <div className="panel-header-left">
                  <h2 className="panel-title">Resume Strength</h2>
                </div>
                <Link to="/student-profile" className="panel-link">Edit {'->'}</Link>
              </div>
              <div className="resume-strength-body">
                <div className="rs-summary">
                  <div className="rs-arc-wrap">
                    <svg viewBox="0 0 100 60" className="rs-arc-svg">
                      <path className="rs-arc-bg"
                            d="M 10 55 A 40 40 0 0 1 90 55"
                            fill="none" strokeWidth="8" strokeLinecap="round" />
                      <path className="rs-arc-fill"
                            d="M 10 55 A 40 40 0 0 1 90 55"
                            fill="none" strokeWidth="8" strokeLinecap="round"
                            strokeDasharray="125" strokeDashoffset={resumeOffset} />
                    </svg>
                    <div className="rs-arc-label">
                      <span className="rs-value">{resumeScore}</span>
                      <span className="rs-unit">/ 100</span>
                    </div>
                  </div>
                  <div className="rs-meta">
                    <span className={`rs-grade rs-grade--${resumeMeta.tone}`}>{resumeMeta.label}</span>
                    <div className="rs-bar" aria-hidden="true">
                      <div className="rs-bar-fill" style={{ width: `${resumeScore}%` }} />
                    </div>
                    <span className="rs-caption">{resumeMeta.caption}</span>
                  </div>
                </div>
                <div className="rs-checklist">
                  <div className={`rs-item ${dashboard.resumeStrength.hasWorkExperience ? 'rs-item--done' : ''}`}>
                    {dashboard.resumeStrength.hasWorkExperience ? <CheckIcon /> : <InfoIcon />}
                    Work Experience
                  </div>
                  <div className={`rs-item ${dashboard.resumeStrength.hasSkills ? 'rs-item--done' : ''}`}>
                    {dashboard.resumeStrength.hasSkills ? <CheckIcon /> : <InfoIcon />}
                    Skills Listed
                  </div>
                  <div className={`rs-item ${dashboard.resumeStrength.hasPortfolio ? 'rs-item--done' : ''}`}>
                    {dashboard.resumeStrength.hasPortfolio ? <CheckIcon /> : <InfoIcon />}
                    Add a portfolio link
                  </div>
                  <div className={`rs-item ${dashboard.resumeStrength.hasLatestResume ? 'rs-item--done' : ''}`}>
                    {dashboard.resumeStrength.hasLatestResume ? <CheckIcon /> : <InfoIcon />}
                    Upload latest resume
                  </div>
                </div>
              </div>
            </div>

            <div className="panel panel--compact quick-actions-panel">
              <div className="panel-header">
                <h2 className="panel-title">Quick Actions</h2>
              </div>
              <div className="quick-actions">
                <Link to="/browse-jobs" className="qa-item qa-item--primary">
                  <div className="qa-icon">
                    <SearchIcon />
                  </div>
                  <div className="qa-text">
                    <span className="qa-title">Browse Jobs</span>
                    <span className="qa-sub">{dashboard.newListingsTodayCount} new listings today</span>
                  </div>
                  <ArrowIcon />
                </Link>
                <Link to="/my-applications" className="qa-item">
                  <div className="qa-icon qa-icon--slate">
                    <ClipboardIcon />
                  </div>
                  <div className="qa-text">
                    <span className="qa-title">Track Applications</span>
                    <span className="qa-sub">{dashboard.awaitingUpdateCount} awaiting update</span>
                  </div>
                  <ArrowIcon />
                </Link>
                <Link to="/student-profile" className="qa-item">
                  <div className="qa-icon qa-icon--slate">
                    <FileIcon />
                  </div>
                  <div className="qa-text">
                    <span className="qa-title">Update Resume</span>
                    <span className="qa-sub">Boost your match score</span>
                  </div>
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="qa-arrow" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
