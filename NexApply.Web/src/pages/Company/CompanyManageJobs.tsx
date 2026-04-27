import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {CompanySidebar} from '../../components/CompanySidebar';
import {CompanyHeader} from '../../components/CompanyHeader';
import { jobListingService, type JobListingSummaryDto } from '../../services/jobListingService';
import './CompanyManageJobs.css';

const JOB_TYPE_MAP: Record<number, string> = {
  0: 'FullTime', 1: 'PartTime', 2: 'Internship', 3: 'Freelance', 4: 'Remote'
};

const WORK_SETUP_MAP: Record<number, string> = {
  0: 'OnSite', 1: 'Remote', 2: 'Hybrid'
};

const STATUS_MAP: Record<number, string> = {
  0: 'Active', 1: 'Paused', 2: 'Closed'
};

const formatDate = (dateStr: string, short = false): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', short
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' }
  );
};

const formatType = (type: number): string => {
  const typeStr = JOB_TYPE_MAP[type] || '';
  return typeStr === 'FullTime' ? 'Full-Time' : typeStr === 'PartTime' ? 'Part-Time' : typeStr;
};

const isExpired = (deadline?: string): boolean => {
  if (!deadline) return false;
  return new Date(deadline) < new Date(new Date().setHours(0, 0, 0, 0));
};

const formatSalary = (min?: number, max?: number): string => {
  if (!min || !max) return '';
  const fmt = (n: number) => n >= 1000 ? `₱${(n / 1000).toFixed(0)}k` : `₱${n}`;
  return `${fmt(min)} – ${fmt(max)} / mo`;
};

// Icons
const IconPeople = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconSearch = () => (
  <svg className="cmj-search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IconPause = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
);

const IconPlay = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const IconXCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const IconChevron = ({ rotated }: { rotated: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={`cmj-chevron${rotated ? ' rotated' : ''}`}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const IconBriefcase = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const CompanyManageJobs: React.FC = () => {
  const [jobs, setJobs] = useState<JobListingSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      const result = await jobListingService.getCompanyJobListings();
      if (result.isSuccess && result.value) {
        setJobs(result.value);
      } else {
        setError(result.error || 'Failed to load job listings');
      }
      setIsLoading(false);
    };
    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = jobs.filter(j => {
      const jobTypeStr = JOB_TYPE_MAP[j.jobType] || '';
      const statusStr = STATUS_MAP[j.status] || '';
      return (
        (!q || j.title.toLowerCase().includes(q) || jobTypeStr.toLowerCase().includes(q) || j.location.toLowerCase().includes(q)) &&
        (!statusFilter || statusStr === statusFilter) &&
        (!typeFilter || jobTypeStr === typeFilter)
      );
    });
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'applicants': return b.totalApplicants - a.totalApplicants;
        case 'title': return a.title.localeCompare(b.title);
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [jobs, searchQuery, statusFilter, typeFilter, sortBy]);

  const totalApplicants = jobs.reduce((s, j) => s + j.totalApplicants, 0);
  const countActive = jobs.filter(j => j.status === 0).length;
  const countPaused = jobs.filter(j => j.status === 1).length;
  const countClosed = jobs.filter(j => j.status === 2).length;

  const toggleExpand = (id: string) => setExpandedJobId(p => p === id ? null : id);
  
  const toggleStatus = async (id: string) => {
    const job = jobs.find(j => j.id === id);
    if (!job) return;
    const newStatus = job.status === 0 ? 1 : 0;
    const result = await jobListingService.updateJobListingStatus(id, newStatus);
    if (result.isSuccess) {
      setJobs(jobs.map(j => j.id === id ? { ...j, status: newStatus } : j));
    }
  };
  
  const closeJobListing = async (id: string) => {
    const result = await jobListingService.updateJobListingStatus(id, 2);
    if (result.isSuccess) {
      setJobs(jobs.map(j => j.id === id ? { ...j, status: 2 } : j));
    }
  };

  if (isLoading) {
    return (
      <div className="cmj-page">
        <CompanySidebar />
        <div className="cmj-main">
          <CompanyHeader title="Manage Jobs" subtitle="Loading..." />
          <div className="cmj-body">
            {/* Summary Stats Skeleton */}
            <div className="cmj-summary-stats">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="cmj-stat-chip" style={{ minWidth: '120px' }}>
                  <div style={{ width: '40px', height: '24px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '4px' }} />
                  <div style={{ width: '80px', height: '12px', background: '#F1F5F9', borderRadius: '6px' }} />
                </div>
              ))}
              <div className="cmj-stat-actions">
                <div style={{ width: '120px', height: '40px', background: '#F1F5F9', borderRadius: '8px' }} />
              </div>
            </div>

            {/* Filter Bar Skeleton */}
            <div className="cmj-filter-bar">
              <div style={{ flex: 1, height: '40px', background: '#F1F5F9', borderRadius: '8px' }} />
              <div className="cmj-filter-controls">
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ width: '140px', height: '40px', background: '#F1F5F9', borderRadius: '8px' }} />
                ))}
              </div>
            </div>

            {/* Job Cards Skeleton */}
            <div className="cmj-job-list">
              {[1, 2, 3].map(i => (
                <div key={i} className="cmj-job-card">
                  <div className="cmj-job-card-main">
                    <div className="cmj-job-card-left" style={{ flex: 1 }}>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ width: '60%', height: '20px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '8px' }} />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ width: '80px', height: '24px', background: '#F1F5F9', borderRadius: '6px' }} />
                          <div style={{ width: '100px', height: '24px', background: '#F1F5F9', borderRadius: '6px' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ width: '120px', height: '14px', background: '#F1F5F9', borderRadius: '6px' }} />
                        <div style={{ width: '100px', height: '14px', background: '#F1F5F9', borderRadius: '6px' }} />
                      </div>
                    </div>
                    <div className="cmj-job-card-right">
                      <div style={{ width: '100px', height: '32px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '8px' }} />
                      <div style={{ width: '80px', height: '28px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '8px' }} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[1, 2, 3, 4].map(j => (
                          <div key={j} style={{ width: '70px', height: '32px', background: '#F1F5F9', borderRadius: '6px' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cmj-page">
        <CompanySidebar />
        <div className="cmj-main">
          <CompanyHeader title="Manage Jobs" subtitle="Error" />
          <div className="cmj-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <div style={{ textAlign: 'center', color: '#DC2626' }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cmj-page">
      <CompanySidebar />

      <div className="cmj-main">
        <CompanyHeader title="Manage Jobs" subtitle="View, edit, and manage your active listings" />

        <div className="cmj-body">
          {/* Summary Stats */}
          <div className="cmj-summary-stats">
            <div className="cmj-stat-chip cmj-stat-chip--total">
              <span className="cmj-stat-chip-value">{jobs.length}</span>
              <span className="cmj-stat-chip-label">Total Listings</span>
            </div>
            <div className="cmj-stat-divider" />
            <div className="cmj-stat-chip cmj-stat-chip--active">
              <span className="cmj-stat-chip-dot" /><span className="cmj-stat-chip-value">{countActive}</span>
              <span className="cmj-stat-chip-label">Active</span>
            </div>
            <div className="cmj-stat-divider" />
            <div className="cmj-stat-chip cmj-stat-chip--paused">
              <span className="cmj-stat-chip-dot" /><span className="cmj-stat-chip-value">{countPaused}</span>
              <span className="cmj-stat-chip-label">Paused</span>
            </div>
            <div className="cmj-stat-divider" />
            <div className="cmj-stat-chip cmj-stat-chip--closed">
              <span className="cmj-stat-chip-dot" /><span className="cmj-stat-chip-value">{countClosed}</span>
              <span className="cmj-stat-chip-label">Closed</span>
            </div>
            <div className="cmj-stat-divider" />
            <div className="cmj-stat-chip cmj-stat-chip--applicants">
              <IconPeople size={14} />
              <span className="cmj-stat-chip-value">{totalApplicants}</span>
              <span className="cmj-stat-chip-label">Total Applicants</span>
            </div>
            <div className="cmj-stat-actions">
              <Link to="/company-post-job" className="cmj-btn-primary">
                <IconPlus /> Post a Job
              </Link>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="cmj-filter-bar">
            <div className="cmj-search-wrap">
              <IconSearch />
              <input
                className="cmj-search-input"
                type="search"
                placeholder="Search by title, type, or location..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="cmj-filter-controls">
              <select className="cmj-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Closed">Closed</option>
              </select>
              <select className="cmj-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                <option value="FullTime">Full-Time</option>
                <option value="PartTime">Part-Time</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
                <option value="Remote">Remote</option>
              </select>
              <select className="cmj-filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="applicants">Most Applicants</option>
                <option value="title">Title A–Z</option>
              </select>
            </div>
          </div>

          {/* Job List */}
          <div className="cmj-job-list">
            {filteredJobs.length === 0 ? (
              <div className="cmj-empty-state">
                <div className="cmj-empty-icon"><IconBriefcase /></div>
                <p className="cmj-empty-title">No listings found</p>
                <p className="cmj-empty-sub">Try adjusting your filters or post a new job.</p>
                <Link to="/company-post-job" className="cmj-btn-primary">Post a Job</Link>
              </div>
            ) : (
              filteredJobs.map(job => {
                const expanded = expandedJobId === job.id;
                const statusStr = STATUS_MAP[job.status] || 'Active';
                return (
                  <div key={job.id} className={`cmj-job-card${expanded ? ' expanded' : ''}`}>
                    <div className="cmj-job-card-main" onClick={() => toggleExpand(job.id)}>
                      <div className="cmj-job-card-left">
                        <div className="cmj-job-title-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                            <span className="cmj-job-title">{job.title}</span>
                            {job.deadline && (
                              <span className={`cmj-meta-item${isExpired(job.deadline) ? ' cmj-meta-item--expired' : ''}`} style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                                <IconClock />
                                {isExpired(job.deadline) ? 'Expired' : 'Closes'} {formatDate(job.deadline, true)}
                              </span>
                            )}
                          </div>
                          <div className="cmj-job-badges">
                            <span className="cmj-badge cmj-badge--type">{formatType(job.jobType)}</span>
                            <span className="cmj-badge cmj-badge--location">{job.location}</span>
                          </div>
                        </div>
                        <div className="cmj-job-meta">
                          <span className="cmj-meta-item">
                            <IconCalendar /> Posted {formatDate(job.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="cmj-job-card-right">
                        <div className="cmj-applicant-count">
                          <IconPeople size={14} />
                          <span className="cmj-applicant-num">{job.totalApplicants}</span>
                          <span className="cmj-applicant-label">applicant{job.totalApplicants === 1 ? '' : 's'}</span>
                        </div>

                        <div className={`cmj-status-badge cmj-status-badge--${statusStr.toLowerCase()}`}>
                          <span className="cmj-status-dot" />{statusStr}
                        </div>

                        <div className="cmj-card-actions" onClick={e => e.stopPropagation()}>
                          <Link to={`/company/jobs/${job.id}`} className="cmj-btn-action cmj-btn-action--view" title="View Details">
                            <IconPeople size={14} /><span>View Details</span>
                          </Link>
                          <Link to={`/company-applicants/${job.id}`} className="cmj-btn-action cmj-btn-action--view" title="View Applicants">
                            <IconPeople size={14} /><span>Applicants</span>
                          </Link>
                          <Link to={`/company/jobs/${job.id}/edit`} className="cmj-btn-action cmj-btn-action--edit" title="Edit Job">
                            <IconEdit /><span>Edit</span>
                          </Link>
                          <button
                            className="cmj-btn-action cmj-btn-action--toggle"
                            title={`${job.status === 0 ? 'Pause' : 'Activate'} Listing`}
                            onClick={() => toggleStatus(job.id)}
                          >
                            {job.status === 0 ? <><IconPause /><span>Pause</span></> : <><IconPlay /><span>Activate</span></>}
                          </button>
                          <button
                            className="cmj-btn-action cmj-btn-action--close"
                            title="Close Listing"
                            disabled={job.status === 2}
                            onClick={() => closeJobListing(job.id)}
                          >
                            <IconXCircle /><span>Close</span>
                          </button>
                        </div>

                        <button
                          className="cmj-expand-toggle"
                          aria-label={`${expanded ? 'Collapse' : 'Expand'} job details`}
                          onClick={e => { e.stopPropagation(); toggleExpand(job.id); }}
                        >
                          <IconChevron rotated={expanded} />
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="cmj-job-card-detail">
                        <div className="cmj-detail-section">
                          <span className="cmj-detail-label">ROLE SUMMARY</span>
                          <p className="cmj-detail-text">
                            {(() => {
                              const sentences = job.description.match(/[^.!?]+[.!?]+/g) || [];
                              const firstTwo = sentences.slice(0, 2).join(' ');
                              return sentences.length > 2 ? `${firstTwo}...` : job.description;
                            })()}
                          </p>
                        </div>
                        <div className="cmj-detail-section">
                          <span className="cmj-detail-label">REQUIRED SKILLS</span>
                          <div className="cmj-detail-skills">
                            {(() => {
                              const skills = job.requiredSkills.split(',').map(s => s.trim());
                              const displaySkills = skills.slice(0, 10);
                              const remaining = skills.length - 10;
                              return (
                                <>
                                  {displaySkills.map((s, i) => <span key={i} className="cmj-skill-chip">{s}</span>)}
                                  {remaining > 0 && (
                                    <span className="cmj-skill-chip" style={{ background: '#E2E8F0', color: '#64748B', fontWeight: '500' }}>
                                      +{remaining} more
                                    </span>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="cmj-detail-row">
                          <div className="cmj-detail-section">
                            <span className="cmj-detail-label">APPLICANT BREAKDOWN</span>
                            <div className="cmj-pipeline-mini">
                              <div className="cmj-pipeline-stage">
                                <span className="cmj-pipeline-stage-name">Submitted</span>
                                <span className="cmj-pipeline-stage-count">{job.submittedCount}</span>
                              </div>
                              <div className="cmj-pipeline-stage">
                                <span className="cmj-pipeline-stage-name">Under Review</span>
                                <span className="cmj-pipeline-stage-count">{job.underReviewCount}</span>
                              </div>
                              <div className="cmj-pipeline-stage">
                                <span className="cmj-pipeline-stage-name">Shortlisted</span>
                                <span className="cmj-pipeline-stage-count">{job.shortlistedCount}</span>
                              </div>
                              <div className="cmj-pipeline-stage">
                                <span className="cmj-pipeline-stage-name">For Interview</span>
                                <span className="cmj-pipeline-stage-count">{job.forInterviewCount}</span>
                              </div>
                            </div>
                          </div>
                          {(job.salaryMin && job.salaryMax) && (
                            <div className="cmj-detail-section">
                              <span className="cmj-detail-label">SALARY RANGE</span>
                              <span className="cmj-detail-value">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                          <Link 
                            to={`/company/jobs/${job.id}`} 
                            className="cmj-btn-primary"
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                            View Full Details
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyManageJobs;
