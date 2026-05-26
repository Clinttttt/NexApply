import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {CompanySidebar} from '../../components/CompanySidebar';
import {CompanyHeader} from '../../components/CompanyHeader';
import { jobListingService, type JobListingDetailsDto } from '../../services/jobListingService';
import './CompanyJobView.css';



function formatSalary(min?: number, max?: number) {
  if (!min || !max) return 'Not specified';
  const fmt = (n: number) => n >= 1000 ? `₱${(n / 1000).toFixed(0)}k` : `₱${n}`;
  return `${fmt(min)} – ${fmt(max)} / mo`;
}

function StatusBadge({ status }: { status: string }) {
  const statusLower = status.toLowerCase();
  return <span className={`cjv-badge cjv-badge--${statusLower}`}>{status}</span>;
}

function Tag({ label, variant = 'default' }: { label: string; variant?: 'default' | 'blue' }) {
  return <span className={`cjv-tag ${variant === 'blue' ? 'cjv-tag--blue' : ''}`}>{label}</span>;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function CompanyJobView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobListingDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'pause' | 'close' | 'activate' | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const shareUrl = useMemo(() => {
    if (!job?.id) return '';
    return `${window.location.origin}/job-board?jobId=${job.id}`;
  }, [job?.id]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for non-secure contexts / older browsers
      try {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        return true;
      } catch {
        return false;
      }
    }
  };

  const loadJobDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    const result = await jobListingService.getJobListingDetails(id);
    if (result.isSuccess && result.value) {
      setJob(result.value);
    } else {
      setError(result.error || 'Failed to load job details');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadJobDetails();
  }, [id]);

  const handleStatusUpdate = async (action: 'pause' | 'close' | 'activate') => {
    if (!id || !job) return;
    
    setIsUpdatingStatus(true);
    setConfirmAction(null);
    setConfirmDelete(false);

    const statusMap = {
      activate: 0, // Active
      pause: 1,    // Paused
      close: 2     // Closed
    };

    const statusLabelMap = {
      activate: 'Active',
      pause: 'Paused',
      close: 'Closed'
    };

    const result = await jobListingService.updateJobListingStatus(id, statusMap[action]);
    
    if (result.isSuccess) {
      // Update status locally without full refresh
      setJob({
        ...job,
        status: statusLabelMap[action]
      });
    } else {
      setError(result.error || 'Failed to update job status');
    }

    setIsUpdatingStatus(false);
  };

  const handleDuplicate = () => {
    if (!job) return;
    navigate('/company-post-job', { state: { duplicateFrom: job } });
  };

  const handleShare = async () => {
    if (!job) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: job.title,
          text: `${job.title} at ${job.companyName}`,
          url: shareUrl,
        });
        showToast('Shared successfully');
        return;
      }

      const ok = await copyToClipboard(shareUrl);
      showToast(ok ? 'Link copied to clipboard' : 'Could not copy link');
    } catch {
      showToast('Share cancelled');
    }
  };

  const handleDelete = async () => {
    if (!job) return;

    setIsDeleting(true);
    setConfirmDelete(false);
    setConfirmAction(null);

    const result = await jobListingService.deleteJobListing(job.id);
    if (result.isSuccess) {
      showToast('Listing deleted');
      navigate('/company-manage-jobs');
    } else {
      setError(result.error || 'Failed to delete job listing');
      showToast('Delete failed');
    }

    setIsDeleting(false);
  };

  if (isLoading) {
    return (
      <div className="cjv-shell">
        <CompanySidebar />
        <div className="cjv-main">
          <CompanyHeader title="Job Details" subtitle="Loading..." />
          <div className="cjv-body">
            <div className="cjv-layout">
              <div className="cjv-content">
                {/* Header Card Skeleton */}
                <div className="cjv-card cjv-card--header" style={{ minHeight: '180px' }}>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ width: '56px', height: '56px', background: '#F1F5F9', borderRadius: '12px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ width: '60%', height: '24px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '8px' }} />
                      <div style={{ width: '40%', height: '16px', background: '#F1F5F9', borderRadius: '6px' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '80px', height: '28px', background: '#F1F5F9', borderRadius: '6px' }} />
                    <div style={{ width: '80px', height: '28px', background: '#F1F5F9', borderRadius: '6px' }} />
                    <div style={{ width: '120px', height: '28px', background: '#F1F5F9', borderRadius: '6px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '30%', height: '14px', background: '#F1F5F9', borderRadius: '6px' }} />
                    <div style={{ width: '30%', height: '14px', background: '#F1F5F9', borderRadius: '6px' }} />
                  </div>
                </div>
                {/* Content Skeletons */}
                {[1, 2, 3].map(i => (
                  <div key={i} className="cjv-card" style={{ minHeight: '120px' }}>
                    <div style={{ width: '40%', height: '18px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '16px' }} />
                    <div style={{ width: '100%', height: '14px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '8px' }} />
                    <div style={{ width: '90%', height: '14px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '8px' }} />
                    <div style={{ width: '80%', height: '14px', background: '#F1F5F9', borderRadius: '6px' }} />
                  </div>
                ))}
              </div>
              <aside className="cjv-sidebar">
                {/* Stats Card Skeleton */}
                <div className="cjv-card" style={{ minHeight: '200px' }}>
                  <div style={{ width: '50%', height: '16px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '16px' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ width: '40px', height: '32px', background: '#F1F5F9', borderRadius: '6px', margin: '0 auto 8px' }} />
                        <div style={{ width: '60px', height: '12px', background: '#F1F5F9', borderRadius: '6px', margin: '0 auto' }} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Info Card Skeleton */}
                <div className="cjv-card" style={{ minHeight: '300px' }}>
                  <div style={{ width: '50%', height: '16px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '16px' }} />
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ width: '32px', height: '32px', background: '#F1F5F9', borderRadius: '6px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ width: '40%', height: '12px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '6px' }} />
                        <div style={{ width: '60%', height: '14px', background: '#F1F5F9', borderRadius: '6px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="cjv-shell">
        <CompanySidebar />
        <div className="cjv-main">
          <CompanyHeader title="Job Details" subtitle="Error" />
          <div className="cjv-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <div style={{ textAlign: 'center', color: '#DC2626' }}>{error || 'Job not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cjv-shell">
      <CompanySidebar  />

      <div className="cjv-main">
        <CompanyHeader
          title="Job Details"
          subtitle="Full listing overview and management"
        />

        <div className="cjv-body">
          {toast && <div className="cjv-toast" role="status" aria-live="polite">{toast}</div>}

          {/* ── Top Action Bar ── */}
          <div className="cjv-action-bar">
            <Link to="/company-manage-jobs" className="cjv-back-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to Manage Jobs
            </Link>

            <div className="cjv-action-btns">
              <button className="cjv-btn cjv-btn--ghost" onClick={() => navigate(`/company/jobs/${job.id}/edit`)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Listing
              </button>

              {job.status === 'Active' && (
                <button
                  className="cjv-btn cjv-btn--amber"
                  onClick={() => setConfirmAction('pause')}
                  disabled={isUpdatingStatus}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                  </svg>
                  Pause
                </button>
              )}

              {job.status === 'Paused' && (
                <button 
                  className="cjv-btn cjv-btn--green"
                  onClick={() => setConfirmAction('activate')}
                  disabled={isUpdatingStatus}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Reactivate
                </button>
              )}

              {job.status !== 'Closed' && (
                <button
                  className="cjv-btn cjv-btn--danger"
                  onClick={() => setConfirmAction('close')}
                  disabled={isUpdatingStatus}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  Close Listing
                </button>
              )}

              <button
                className="cjv-btn cjv-btn--primary"
                onClick={() => navigate(`/company-applicants?jobListingId=${job.id}`)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                View Applicants
                <span className="cjv-btn-count">{job.totalApplicants}</span>
              </button>
            </div>
          </div>

          {/* ── Confirm Dialog ── */}
          {confirmAction && (
            <div className="cjv-confirm-banner">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p>
                Are you sure you want to <strong>{confirmAction}</strong> this listing?
                {confirmAction === 'close' && ' This cannot be undone.'}
              </p>
              <div className="cjv-confirm-actions">
                <button className="cjv-btn cjv-btn--ghost cjv-btn--sm"
                        onClick={() => setConfirmAction(null)}
                        disabled={isUpdatingStatus}>
                  Cancel
                </button>
                <button
                  className={`cjv-btn cjv-btn--sm ${
                    confirmAction === 'close' ? 'cjv-btn--danger' : 
                    confirmAction === 'activate' ? 'cjv-btn--green' : 'cjv-btn--amber'
                  }`}
                  onClick={() => handleStatusUpdate(confirmAction)}
                  disabled={isUpdatingStatus}
                >
                  {isUpdatingStatus ? 'Updating...' : `Confirm ${confirmAction === 'pause' ? 'Pause' : confirmAction === 'activate' ? 'Reactivate' : 'Close'}`}
                </button>
              </div>
            </div>
          )}

          {confirmDelete && (
            <div className="cjv-confirm-banner cjv-confirm-banner--danger">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              <p>
                Delete <strong>{job.title}</strong>? This can’t be undone.
                If the listing already has applicants, deletion will be blocked — close it instead.
              </p>
              <div className="cjv-confirm-actions">
                <button
                  className="cjv-btn cjv-btn--ghost cjv-btn--sm"
                  onClick={() => setConfirmDelete(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="cjv-btn cjv-btn--danger cjv-btn--sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting…' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          )}

          <div className="cjv-layout">

            {/* ══ LEFT: Main Content ══ */}
            <div className="cjv-content">

              {/* ── Job Header Card ── */}
              <div className="cjv-card cjv-card--header">
                <div className="cjv-job-title-row">
                  <div className="cjv-company-avatar">{job.companyName.substring(0, 2).toUpperCase()}</div>
                  <div className="cjv-job-title-group">
                    <div className="cjv-job-title-top">
                      <h2 className="cjv-job-title">{job.title}</h2>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="cjv-job-company">{job.companyName}</p>
                  </div>
                </div>

                <div className="cjv-job-tags">
                  <Tag label={job.jobType} variant="blue" />
                  <Tag label={job.workSetup} />
                  <Tag label={job.location} />
                  {job.experienceLevel && <Tag label={job.experienceLevel} />}
                </div>

                <div className="cjv-job-meta-strip">
                  <span className="cjv-meta-item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Posted {formatDate(job.createdAt)}
                  </span>
                  <span className="cjv-meta-sep">·</span>
                  <span className="cjv-meta-item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Deadline {formatDate(job.deadline)}
                  </span>
                  <span className="cjv-meta-sep">·</span>
                  <span className={`cjv-meta-item ${job.daysLeft <= 7 ? 'cjv-meta-urgent' : ''}`}>
                    {job.daysLeft} days remaining
                  </span>
                </div>
              </div>

              {/* ── Description ── */}
              <div className="cjv-card">
                <h3 className="cjv-section-title">Role Overview</h3>
                <p className="cjv-prose">{job.description}</p>
              </div>

              {/* ── Responsibilities ── */}
              <div className="cjv-card">
                <h3 className="cjv-section-title">Key Responsibilities</h3>
                <ul className="cjv-bullet-list">
                  {job.responsibilities.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i}>{line.replace(/^•\s*/, '')}</li>
                  ))}
                </ul>
              </div>

              {/* ── Qualifications ── */}
              <div className="cjv-card">
                <h3 className="cjv-section-title">Qualifications</h3>
                <ul className="cjv-bullet-list">
                  {job.qualifications.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i}>{line.replace(/^•\s*/, '')}</li>
                  ))}
                </ul>
              </div>

              {/* ── Required Skills ── */}
              <div className="cjv-card">
                <h3 className="cjv-section-title">Required Skills</h3>
                <div className="cjv-skills-grid">
                  {job.requiredSkills.split(',').map((skill, i) => (
                    <span key={i} className="cjv-skill-chip">{skill.trim()}</span>
                  ))}
                </div>
              </div>

              {/* ── Benefits ── */}
              {job.benefits && (
                <div className="cjv-card">
                  <h3 className="cjv-section-title">Perks & Benefits</h3>
                  <ul className="cjv-bullet-list cjv-bullet-list--green">
                    {job.benefits.split('\n').filter(Boolean).map((line, i) => (
                      <li key={i}>{line.replace(/^•\s*/, '')}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* ══ RIGHT: Sidebar Info ══ */}
            <aside className="cjv-sidebar">

              {/* ── Stats Card ── */}
              <div className="cjv-card cjv-stats-card">
                <h3 className="cjv-sidebar-card-title">Listing Stats</h3>
                <div className="cjv-stats-grid">
                  <div className="cjv-stat">
                    <span className="cjv-stat-value">{job.totalApplicants}</span>
                    <span className="cjv-stat-label">Total Applicants</span>
                  </div>
                  <div className="cjv-stat">
                    <span className="cjv-stat-value">{job.openings}</span>
                    <span className="cjv-stat-label">Openings</span>
                  </div>
                  <div className="cjv-stat">
                    <span className="cjv-stat-value">{job.daysLeft}</span>
                    <span className="cjv-stat-label">Days Left</span>
                  </div>
                  <div className="cjv-stat">
                    <span className="cjv-stat-value cjv-stat-value--green">{job.shortlistedCount}</span>
                    <span className="cjv-stat-label">Shortlisted</span>
                  </div>
                </div>

                <Link to={`/company-applicants?jobListingId=${job.id}`} className="cjv-view-applicants-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Review All Applicants
                </Link>
              </div>

              {/* ── Job Info Card ── */}
              <div className="cjv-card">
                <h3 className="cjv-sidebar-card-title">Job Information</h3>
                <div className="cjv-info-list">
                  <div className="cjv-info-row">
                    <span className="cjv-info-icon">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                    </span>
                    <div>
                      <span className="cjv-info-label">Job Type</span>
                      <span className="cjv-info-value">{job.jobType}</span>
                    </div>
                  </div>
                  <div className="cjv-info-row">
                    <span className="cjv-info-icon">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <path d="M3 9h18M9 21V9"/>
                      </svg>
                    </span>
                    <div>
                      <span className="cjv-info-label">Work Setup</span>
                      <span className="cjv-info-value">{job.workSetup}</span>
                    </div>
                  </div>
                  <div className="cjv-info-row">
                    <span className="cjv-info-icon">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </span>
                    <div>
                      <span className="cjv-info-label">Location</span>
                      <span className="cjv-info-value">{job.location}</span>
                    </div>
                  </div>
                  <div className="cjv-info-row">
                    <span className="cjv-info-icon">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </span>
                    <div>
                      <span className="cjv-info-label">Salary Range</span>
                      <span className="cjv-info-value">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    </div>
                  </div>
                  <div className="cjv-info-row">
                    <span className="cjv-info-icon">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span>
                    <div>
                      <span className="cjv-info-label">Experience Level</span>
                      <span className="cjv-info-value">{job.experienceLevel}</span>
                    </div>
                  </div>
                  <div className="cjv-info-row">
                    <span className="cjv-info-icon">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </span>
                    <div>
                      <span className="cjv-info-label">Openings</span>
                      <span className="cjv-info-value">{job.openings} position{job.openings > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="cjv-info-row">
                    <span className="cjv-info-icon">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </span>
                    <div>
                      <span className="cjv-info-label">Application Deadline</span>
                      <span className="cjv-info-value">{formatDate(job.deadline)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Quick Actions ── */}
              <div className="cjv-card cjv-quick-actions">
                <h3 className="cjv-sidebar-card-title">Quick Actions</h3>
                <div className="cjv-action-list">
                  <button
                    className="cjv-action-item"
                    onClick={() => navigate(`/company/jobs/${job.id}/edit`)}
                    disabled={isDeleting || isUpdatingStatus}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit Listing
                  </button>
                  <button
                    className="cjv-action-item"
                    onClick={handleDuplicate}
                    disabled={isDeleting || isUpdatingStatus}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Duplicate Listing
                  </button>
                  <button
                    className="cjv-action-item"
                    onClick={handleShare}
                    disabled={isDeleting || isUpdatingStatus}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                      <polyline points="16 6 12 2 8 6"/>
                      <line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                    Share Listing
                  </button>
                  <button
                    className="cjv-action-item cjv-action-item--danger"
                    onClick={() => {
                      setConfirmDelete(true);
                      setConfirmAction(null);
                    }}
                    disabled={isDeleting || isUpdatingStatus}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                    Delete Listing
                  </button>
                </div>
              </div>

            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyJobView;
