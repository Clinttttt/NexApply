import { useState, useMemo, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './CompanyApplicants.css'
import {CompanySidebar} from '../../components/CompanySidebar';
import {CompanyHeader} from '../../components/CompanyHeader';
import { ScheduleInterviewModal } from '../../components/modal/ScheduleInterviewModal';
import { ApplicantResumeModal } from '../../components/modal/ApplicantResumeModal';
import { companyApplicantsService, type ApplicantDto } from '../../services/companyApplicantsService';
import { companyInterviewsService } from '../../services/companyInterviewsService';
import { jobListingService, type JobListingSummaryDto } from '../../services/jobListingService';
import { CustomSelect } from '../../components/CustomSelect';

// ─────────────────────────────────────────
//  INTERFACES
// ─────────────────────────────────────────

interface StageStyle {
  cssClass: string
}

// ─────────────────────────────────────────
//  STATIC DATA
// ─────────────────────────────────────────

const STAGES: Record<string, StageStyle> = {
  'Submitted':    { cssClass: 'submitted' },
  'UnderReview': { cssClass: 'review' },
  'Shortlisted':  { cssClass: 'shortlisted' },
  'ForInterview':{ cssClass: 'interview' },
  'Declined':     { cssClass: 'declined' },
  'Passed':       { cssClass: 'passed' },
}

// ─────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────

const getInitials = (name: string) =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('')

const getMatchClass = (score: number) =>
  score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low'

const getAvatarColor = (id: string) => {
  const hashCode = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return ['blue', 'green', 'amber', 'slate', 'purple'][hashCode % 5]
}

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

// ─────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────

export default function CompanyApplicants() {
  const location = useLocation()
  const navigate = useNavigate()

  // ── State ──────────────────────────────
  const [jobs, setJobs]                       = useState<JobListingSummaryDto[]>([])
  const [applicants, setApplicants]           = useState<ApplicantDto[]>([])
  const [selectedJobId, setSelectedJobId]     = useState<string | null>(null)
  const [searchQuery, setSearchQuery]         = useState('')
  const [sortBy, setSortBy]                   = useState('Newest')
  const [activeStageFilter, setActiveStageFilter] = useState('')
  const [bulkStageTarget, setBulkStageTarget] = useState('')
  const [expandedId, setExpandedId]           = useState<string | null>(null)
  const [selectedIds, setSelectedIds]         = useState<Set<string>>(new Set())
  const [showListingsDrop, setShowListingsDrop] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen]     = useState(false)

  // photo cache (applicationId -> objectUrl)
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})
  const photoUrlsRef = useRef<Record<string, string>>({})

  // Modals
  const [showResumeModal, setShowResumeModal]             = useState(false)
  const [resumeApplicant, setResumeApplicant]             = useState<ApplicantDto | null>(null)
  const [showStageModal, setShowStageModal]               = useState(false)
  const [stageApplicant, setStageApplicant]               = useState<ApplicantDto | null>(null)
  const [showScheduleModal, setShowScheduleModal]         = useState(false)
  const [scheduleApplicant, setScheduleApplicant]         = useState<ApplicantDto | null>(null)

  const activeJob = jobs.find(j => j.id === selectedJobId) ?? null

  // Optional: deep-link from ManageJobs
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const jobListingId = params.get('jobListingId')
    if (jobListingId) setSelectedJobId(jobListingId)
    // Only respond to URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  // ── Load Jobs ────────────────────────────
  useEffect(() => {
    const loadJobs = async () => {
      const result = await jobListingService.getCompanyJobListings()
      if (result.isSuccess && result.value) {
        setJobs(result.value)
      }
    }
    loadJobs()
  }, [])

  // ── Load Data ────────────────────────────
  useEffect(() => {
    const loadApplicants = async () => {
      const result = await companyApplicantsService.getApplicants({
        status: activeStageFilter || undefined,
        jobListingId: selectedJobId || undefined,
        searchTerm: searchQuery || undefined,
        sortBy: sortBy
      })

      if (result.isSuccess && result.value) {
        setApplicants(result.value)
      }
    }

    loadApplicants()
  }, [activeStageFilter, selectedJobId, searchQuery, sortBy])

  // ── Filtered + Sorted ──────────────────
  const filteredApplicants = useMemo(() => {
    return applicants
  }, [applicants])

  // keep a ref so we can revoke object URLs on unmount (without revoking on every state update)
  useEffect(() => {
    photoUrlsRef.current = photoUrls
  }, [photoUrls])

  // Cleanup object urls on unmount
  useEffect(() => {
    return () => {
      Object.values(photoUrlsRef.current).forEach(u => {
        try { URL.revokeObjectURL(u) } catch { /* ignore */ }
      })
    }
  }, [])

  // Fetch profile photos for visible applicants (best-effort). We key by applicationId because
  // the Company endpoints authorize via application + company ownership.
  useEffect(() => {
    let isCancelled = false

    const loadPhotos = async () => {
      const targets = filteredApplicants
        .slice(0, 30) // keep it light; list view only
        .filter(a => !photoUrls[a.applicationId])

      if (targets.length === 0) return

      for (const a of targets) {
        const result = await companyApplicantsService.getApplicantProfilePhotoFile(a.applicationId)
        if (isCancelled) return

        if (result.isSuccess && result.value?.blob) {
          const url = URL.createObjectURL(result.value.blob)
          setPhotoUrls(prev => ({ ...prev, [a.applicationId]: url }))
        }
      }
    }

    void loadPhotos()

    return () => {
      isCancelled = true
    }
  }, [filteredApplicants, photoUrls])

  // ── Stage update helper ─────────────────
  const updateStage = async (id: string, stage: string) => {
    const result = await companyApplicantsService.updateApplicationStatus(id, stage)
    if (result.isSuccess) {
      setApplicants(prev => prev.map(a => a.applicationId === id ? { ...a, status: stage } : a))
    }
  }

  const updateNotes = async (id: string, notes: string) => {
    const result = await companyApplicantsService.updateApplicationNotes(id, notes)
    if (result.isSuccess) {
      setApplicants(prev => prev.map(a => a.applicationId === id ? { ...a, recruiterNotes: notes } : a))
    }
  }

  // ── Handlers ───────────────────────────
  const toggleExpand = (id: string) =>
    setExpandedId(prev => prev === id ? null : id)

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleSelectAll = (checked: boolean) =>
    setSelectedIds(checked ? new Set(filteredApplicants.map(a => a.applicationId)) : new Set())

  const clearSelection = () => { setSelectedIds(new Set()); setBulkStageTarget('') }

  const applyBulkStage = async (stage: string) => {
    if (!stage) return
    for (const id of selectedIds) {
      await updateStage(id, stage)
    }
    clearSelection()
  }

  const quickStage = async (app: ApplicantDto, stage: string) =>
    await updateStage(app.applicationId, app.status === stage ? 'Submitted' : stage)

  const selectJobFromDropdown = (id: string | null) => {
    setSelectedJobId(id)
    setExpandedId(null)
    setShowListingsDrop(false)
  }

  // Resume modal
  const openResumeModal  = (app: ApplicantDto) => { setResumeApplicant(app); setShowResumeModal(true) }
  const closeResumeModal = () => { setShowResumeModal(false); setResumeApplicant(null) }

  // Stage action modal
  const openStageModal  = (app: ApplicantDto) => { setStageApplicant(app); setShowStageModal(true) }
  const closeStageModal = () => { setShowStageModal(false); setStageApplicant(null) }

  const moveToStage = async (stage: string) => {
    if (!stageApplicant) return
    await updateStage(stageApplicant.applicationId, stage)
    closeStageModal()
  }

  const moveToInterviewAndSchedule = async () => {
    if (!stageApplicant) return
    await updateStage(stageApplicant.applicationId, 'ForInterview')
    const app = stageApplicant
    closeStageModal()
    setScheduleApplicant(app)
    setShowScheduleModal(true)
  }

  // Schedule modal
  const openScheduleModal  = (app: ApplicantDto) => { setScheduleApplicant(app); setShowScheduleModal(true) }
  const closeScheduleModal = () => { setShowScheduleModal(false); setScheduleApplicant(null) }

  const handleConfirmSchedule = async (result: any) => {
    if (!scheduleApplicant) return

    const { interview, interviewTime, interviewerName } = result
    const [hours, mins] = interviewTime.split(':').map(Number)
    const scheduledAt = new Date(interview.scheduledAt)
    scheduledAt.setHours(hours, mins, 0, 0)

    const scheduledResult = await companyInterviewsService.scheduleInterview({
      applicationId: scheduleApplicant.applicationId,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: interview.durationMins,
      format: interview.format,
      location: interview.format === 'Video Call' ? undefined : interview.location || undefined,
      meetingLink: interview.format === 'Video Call' ? interview.location || undefined : undefined,
      notes: interview.notes || undefined,
      interviewerNames: interviewerName ? [interviewerName.trim()] : []
    })

    if (!scheduledResult.isSuccess) {
      alert(scheduledResult.error || 'Failed to schedule interview')
      return
    }

    setApplicants(prev => prev.map(a =>
      a.applicationId === scheduleApplicant.applicationId ? { ...a, status: 'ForInterview' } : a
    ))
    closeScheduleModal()
  }

  const openMessageThread = (app: ApplicantDto) => {
    // Deep-link into Company Messages by applicant id (reliable; conversations already include ApplicantId).
    navigate(`/company-messages?applicantId=${encodeURIComponent(app.applicationId)}`)
  }

  const exportToCSV = () => {
    if (filteredApplicants.length === 0) return

    const headers = [
      'Applicant Name',
      'Email',
      'Phone',
      'Location',
      'Position',
      'Job Type',
      'Status',
      'Match Score',
      'Applied Date',
      'Skills',
      'LinkedIn',
      'GitHub',
      'Portfolio',
      'Cover Letter',
      'Recruiter Notes'
    ]

    const rows = filteredApplicants.map(app => [
      app.studentName,
      app.email,
      app.phone || '',
      app.location || '',
      app.jobTitle,
      app.jobType,
      app.status,
      app.matchScore?.toString() || '',
      new Date(app.appliedAt).toLocaleDateString('en-US'),
      app.skills.join('; '),
      app.linkedIn || '',
      app.gitHub || '',
      app.portfolio || '',
      app.coverLetter?.replace(/"/g, '""') || '',
      app.recruiterNotes?.replace(/"/g, '""') || ''
    ])

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const fileName = selectedJobId && activeJob
      ? `applicants_${activeJob.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
      : `applicants_all_${new Date().toISOString().split('T')[0]}.csv`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // ── Render ─────────────────────────────
  return (
    <div className="app-shell">
      <CompanySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="main-content">
        <CompanyHeader 
          title="Applicants" 
          subtitle="Review and manage candidates across your listings"
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <div className="page-body">

          {/* ══ Pipeline Summary ══ */}
          <div className="pipeline-summary">
            <div className="pipeline-stages">
              <button
                className={`pipeline-stage-btn ${activeStageFilter === '' ? 'active' : ''}`}
                onClick={() => setActiveStageFilter('')}
              >
                <span className="psb-count">
                  {applicants.filter(a => selectedJobId === null || a.jobListingId === selectedJobId).length}
                </span>
                <span className="psb-label">All</span>
              </button>

              {Object.entries(STAGES).map(([stage, style]) => {
                const count = applicants.filter(a =>
                  a.status === stage && (selectedJobId === null || a.jobListingId === selectedJobId)
                ).length
                return (
                  <>
                    <div key={`div-${stage}`} className="pipeline-stage-divider"></div>
                    <button
                      key={stage}
                      className={`pipeline-stage-btn ${activeStageFilter === stage ? 'active' : ''} pipeline-stage-btn--${style.cssClass}`}
                      onClick={() => setActiveStageFilter(stage)}
                    >
                      <span className="psb-dot"></span>
                      <span className="psb-count">{count}</span>
                      <span className="psb-label">{stage}</span>
                    </button>
                  </>
                )
              })}
            </div>

            <div className="pipeline-actions">
              {/* Listings Dropdown */}
              <div className="listings-dropdown">
                <button className="btn-compact" onClick={() => setShowListingsDrop(p => !p)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span className="listings-dropdown-text">
                    {selectedJobId && activeJob ? activeJob.title : 'All Listings'}
                  </span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {showListingsDrop && (
                  <div className="listings-dropdown-menu">
                    <button
                      className={`listings-dropdown-item ${selectedJobId === null ? 'active' : ''}`}
                      onClick={() => selectJobFromDropdown(null)}
                    >
                      <span className="ldi-title">All Listings</span>
                      <span className="ldi-count">{applicants.length}</span>
                    </button>
                    {jobs.map(job => {
                      const appCount = applicants.filter(a => a.jobListingId === job.id).length
                      return (
                        <button
                          key={job.id}
                          className={`listings-dropdown-item ${selectedJobId === job.id ? 'active' : ''}`}
                          onClick={() => selectJobFromDropdown(job.id)}
                        >
                          <div className="ldi-inner">
                            <span className="ldi-title">{job.title}</span>
                            <div className="ldi-meta">
                              <span className="ldi-badge">{job.jobType}</span>
                              <span className="ldi-loc">{job.location}</span>
                            </div>
                          </div>
                          <span className="ldi-count">{appCount}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <button className="btn-compact" onClick={exportToCSV}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          {/* ══ Main Area ══ */}
          <div className="applicants-main">

            {/* Filter Bar */}
            <div className="filter-bar">
              <div className="search-wrap">
                <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search by name, role, or skill..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-controls">
                <CustomSelect
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: 'Newest', label: 'Newest First' },
                    { value: 'Oldest', label: 'Oldest First' },
                    { value: 'NameAsc', label: 'Name A-Z' },
                    { value: 'BestMatch', label: 'Best Match' }
                  ]}
                  className="filter-select"
                />
              </div>

              {selectedIds.size > 0 && (
                <div className="bulk-actions">
                  <span className="bulk-count">{selectedIds.size} selected</span>
                  <CustomSelect
                    value={bulkStageTarget}
                    onChange={(value) => { setBulkStageTarget(value); applyBulkStage(value) }}
                    options={[
                      { value: '', label: 'Move to stage…' },
                      ...Object.keys(STAGES).map(s => ({ value: s, label: s }))
                    ]}
                    className="filter-select bulk-stage-select"
                  />
                  <button className="btn-danger-ghost" onClick={clearSelection}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Applicant Table */}
            {filteredApplicants.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <p className="empty-title">No applicants found</p>
                <p className="empty-sub">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="applicant-table">

                {/* Table Header */}
                <div className="table-head">
                  <div className="th th--check">
                    <input
                      type="checkbox"
                      className="row-check"
                      checked={selectedIds.size === filteredApplicants.length && filteredApplicants.length > 0}
                      onChange={e => toggleSelectAll(e.target.checked)}
                      aria-label="Select all applicants"
                    />
                  </div>
                  <div className="th th--applicant">Applicant</div>
                  <div className="th th--job">Position</div>
                  <div className="th th--match">Match</div>
                  <div className="th th--stage">Stage</div>
                  <div className="th th--date">Applied</div>
                  <div className="th th--actions"></div>
                </div>

                {/* Table Rows */}
                {filteredApplicants.map(app => {
                  const isSelected = selectedIds.has(app.applicationId)
                  const isExpanded = expandedId === app.applicationId
                  const job = jobs.find(j => j.id === app.jobListingId) ?? null
                  const requiredSkills = job?.requiredSkills ? (typeof job.requiredSkills === 'string' ? job.requiredSkills.split(',').map(s => s.trim()) : job.requiredSkills) : []
                  const missing = requiredSkills.filter(r => !app.skills.map(s => s.toLowerCase()).includes(r.toLowerCase()))
                  const appliedDate = new Date(app.appliedAt)

                  return (
                    <div
                      key={app.applicationId}
                      className={`table-row-wrap ${isExpanded ? 'row-expanded' : ''} ${isSelected ? 'row-selected' : ''}`}
                    >
                      {/* Main Row */}
                      <div className="table-row" onClick={() => toggleExpand(app.applicationId)}>

                        <div className="td td--check" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="row-check"
                            checked={isSelected}
                            onChange={() => toggleSelect(app.applicationId)}
                            aria-label={`Select ${app.studentName}`}
                          />
                        </div>

                        <div className="td td--applicant">
                          <div className={`applicant-avatar applicant-avatar--${getAvatarColor(app.studentId)}`}>
                            {photoUrls[app.applicationId] ? (
                              <img className="applicant-avatar-img" src={photoUrls[app.applicationId]} alt="" />
                            ) : (
                              getInitials(app.studentName)
                            )}
                          </div>
                          <div className="applicant-info">
                            <span className="applicant-name">{app.studentName}</span>
                            <span className="applicant-email">{app.email}</span>
                          </div>
                        </div>

                        <div className="td td--job">
                          {job && (
                            <>
                              <span className="position-title">{app.jobTitle}</span>
                              <span className="position-type">{app.jobType}</span>
                            </>
                          )}
                        </div>

                        <div className="td td--match">
                          <div className={`match-score match-score--${getMatchClass(app.matchScore ?? 0)}`}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                            {app.matchScore ?? 0}%
                          </div>
                        </div>

                        <div className="td td--stage" onClick={e => e.stopPropagation()}>
                          {app.status === 'ForInterview' && (
                            <button className="stage-badge stage-badge--interview" onClick={() => openScheduleModal(app)}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              For Interview
                            </button>
                          )}
                          {app.status === 'Submitted' && (
                            <button className="stage-badge stage-badge--submitted" onClick={() => updateStage(app.applicationId, 'UnderReview')}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                              </svg>
                              Submitted
                            </button>
                          )}
                          {app.status === 'UnderReview' && (
                            <button className="stage-badge stage-badge--review" onClick={() => openStageModal(app)}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                              </svg>
                              Under Review
                            </button>
                          )}
                          {app.status === 'Shortlisted' && (
                            <button className="stage-badge stage-badge--shortlisted" onClick={() => updateStage(app.applicationId, 'ForInterview')}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              Shortlisted
                            </button>
                          )}
                          {app.status === 'Declined' && (
                            <span className="stage-badge stage-badge--declined stage-badge--disabled">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                              </svg>
                              Declined
                            </span>
                          )}
                          {app.status === 'Passed' && (
                            <span className="stage-badge stage-badge--passed stage-badge--disabled">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Passed
                            </span>
                          )}
                        </div>

                        <div className="td td--date">
                          <span className="applied-date">{formatDate(appliedDate)}</span>
                          <span className="applied-year">{appliedDate.getFullYear()}</span>
                        </div>

                        <div className="td td--actions" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            className="row-action row-action--resume"
                            title="View Resume"
                            onClick={() => openResumeModal(app)}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            Resume
                          </button>
                          <button
                            className="row-action row-action--message"
                            title={`Message ${app.studentName}`}
                            onClick={() => openMessageThread(app)}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            Message
                          </button>
                          <button
                            className="row-action row-action--expand"
                            onClick={() => toggleExpand(app.applicationId)}
                            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} applicant details`}
                          >
                            <svg className={`chevron ${isExpanded ? 'rotated' : ''}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Detail Panel */}
                      {isExpanded && (
                        <div className="applicant-detail">
                          <div className="applicant-detail-grid">

                            {/* Col 1: About */}
                            <div className="detail-col">
                              <span className="detail-label">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                </svg>
                                About
                              </span>
                              <div className="detail-about-grid">
                                <span className="about-key">Email</span>
                                <span className="about-val">{app.email}</span>
                                <span className="about-key">Phone</span>
                                <span className="about-val">{app.phone || <span className="about-val--empty">Not provided</span>}</span>
                                <span className="about-key">Location</span>
                                <span className="about-val">{app.location || <span className="about-val--empty">Not provided</span>}</span>                           
                                <span className="about-key">LinkedIn</span>
                                <span className="about-val">
                                  {app.linkedIn
                                    ? <a href={app.linkedIn} target="_blank" rel="noreferrer" className="detail-link">View Profile</a>
                                    : <span className="about-val--empty">Not provided</span>}
                                </span>
                                <span className="about-key">GitHub</span>
                                <span className="about-val">
                                  {app.gitHub
                                    ? <a href={app.gitHub} target="_blank" rel="noreferrer" className="detail-link">View Profile</a>
                                    : <span className="about-val--empty">Not provided</span>}
                                </span>
                                <span className="about-key">Resume</span>
                                <span className="about-val">
                                  <button className="resume-link-btn" onClick={() => openResumeModal(app)}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                      <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    View Resume
                                  </button>
                                </span>
                              </div>
                            </div>

                            <div className="detail-divider-v"></div>

                            {/* Col 2: Skills */}
                            <div className="detail-col">
                              <span className="detail-label">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="9 11 12 14 22 4" />
                                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                </svg>
                                Skills
                              </span>
                              <div className="detail-skills">
                                {app.skills.map(skill => {
                                  const matched = requiredSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase()) ?? false
                                  return (
                                    <span key={skill} className={`skill-chip ${matched ? 'skill-chip--matched' : ''}`}>
                                      {matched && (
                                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                      )}
                                      {skill}
                                    </span>
                                  )
                                })}
                              </div>
                              {missing.length > 0 && (
                                <div className="missing-skills">
                                  <span className="missing-label">Missing</span>
                                  {missing.map(m => <span key={m} className="skill-chip skill-chip--missing">{m}</span>)}
                                </div>
                              )}
                            </div>

                            <div className="detail-divider-v"></div>

                            {/* Col 3: Notes & Actions */}
                            <div className="detail-col detail-col--notes">
                              <span className="detail-label">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                                Recruiter Notes
                              </span>
                              <textarea
                                className="notes-textarea"
                                placeholder="Add private notes about this candidate..."
                                value={app.recruiterNotes || ''}
                                onChange={e => updateNotes(app.applicationId, e.target.value)}
                                rows={4}
                              />
                              <div className="detail-quick-actions">
                                <button
                                  className={`qbtn qbtn--shortlist ${app.status === 'Shortlisted' ? 'active' : ''}`}
                                  onClick={() => quickStage(app, 'Shortlisted')}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                  </svg>
                                  Shortlist
                                </button>
                                <button
                                  className={`qbtn qbtn--interview ${app.status === 'ForInterview' ? 'active' : ''}`}
                                  onClick={() => quickStage(app, 'ForInterview')}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                  </svg>
                                  Schedule Interview
                                </button>
                                <button
                                  className={`qbtn qbtn--decline ${app.status === 'Declined' ? 'active' : ''}`}
                                  onClick={() => quickStage(app, 'Declined')}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                                  </svg>
                                  Decline
                                </button>
                                <button
                                  className={`qbtn qbtn--pass ${app.status === 'Passed' ? 'active' : ''}`}
                                  onClick={() => quickStage(app, 'Passed')}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  Pass
                                </button>
                                {app.status === 'ForInterview' && (
                                  <button className="qbtn qbtn--return" onClick={() => updateStage(app.applicationId, 'Shortlisted')}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                    Return to Shortlisted
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ApplicantResumeModal
        isVisible={showResumeModal && !!resumeApplicant}
        applicationId={resumeApplicant?.applicationId ?? ''}
        applicantName={resumeApplicant?.studentName ?? ''}
        applicantEmail={resumeApplicant?.email ?? ''}
        onClose={closeResumeModal}
      />

      {/* ══ Stage Action Modal ══ */}
      {showStageModal && stageApplicant && (
        <div className="modal-overlay" onClick={closeStageModal}>
          <div className="modal-content modal-content--stage-action" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-block">
                <h2 className="modal-title">Move {stageApplicant.studentName}</h2>
                <p className="modal-subtitle">Current stage: {stageApplicant.status}</p>
              </div>
              <button className="modal-close" onClick={closeStageModal} aria-label="Close modal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body modal-body--stage-actions">
              <button className="stage-action-btn stage-action-btn--shortlist" onClick={() => moveToStage('Shortlisted')}>
                <div className="stage-action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="stage-action-content">
                  <span className="stage-action-title">Shortlist</span>
                  <span className="stage-action-desc">Mark as a strong candidate</span>
                </div>
              </button>
              <button className="stage-action-btn stage-action-btn--interview" onClick={moveToInterviewAndSchedule}>
                <div className="stage-action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="stage-action-content">
                  <span className="stage-action-title">Schedule Interview</span>
                  <span className="stage-action-desc">Move to interview stage</span>
                </div>
              </button>
              <button className="stage-action-btn stage-action-btn--decline" onClick={() => moveToStage('Declined')}>
                <div className="stage-action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <div className="stage-action-content">
                  <span className="stage-action-title">Decline</span>
                  <span className="stage-action-desc">Not a good fit</span>
                </div>
              </button>
              <button className="stage-action-btn stage-action-btn--pass" onClick={() => moveToStage('Passed')}>
                <div className="stage-action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="stage-action-content">
                  <span className="stage-action-title">Pass</span>
                  <span className="stage-action-desc">Mark candidate as passed / decided</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Schedule Interview Modal (reusable) ══ */}
      <ScheduleInterviewModal
        isVisible={showScheduleModal}
        interview={scheduleApplicant ? {
          candidateName: scheduleApplicant.studentName,
          jobTitle: activeJob?.title ?? scheduleApplicant.jobTitle,
          scheduledAt: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          durationMins: 60,
          format: '',
          location: '',
          notes: '',
        } : undefined}
        onClose={closeScheduleModal}
        onConfirm={handleConfirmSchedule}
      />

    </div>
  )
}
