import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './Applications.css'
import {Sidebar} from '../../components/Sidebar'
import {PageHeader} from '../../components/PageHeader'
import { applicationService } from '../../services/applicationService'

// ─────────────────────────────────────────
//  INTERFACES
// ─────────────────────────────────────────

interface AppItem {
  applicationId: string
  jobListingId: string
  company: string
  role: string
  status: string
  jobType: string
  location: string
  appliedAt: string // ISO string
  appliedDate: string // UI formatted date
  pipelineStage: number
}

const PIPELINE_STEPS = ['Submitted', 'Under Review', 'Shortlisted', 'For Interview', 'Decided']

// ─────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────

const getStatusBadgeClass = (status: string): string => ({
  'Submitted':    'status-badge--submitted',
  'Under Review': 'status-badge--review',
  'Shortlisted':  'status-badge--shortlisted',
  'For Interview':'status-badge--interview',
  'Declined':     'status-badge--declined',
}[status] ?? '')

const getInitials = (company: string): string => {
  const words = company.split(' ').filter(Boolean)
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`
  return company.length >= 2 ? company.slice(0, 2).toUpperCase() : company.toUpperCase()
}

const getAvatarClass = (company: string): string => ({
  'Acme Corp':       'company-avatar--blue',
  'TechNova PH':     'company-avatar--green',
  'CodeBridge Co.':  'company-avatar--purple',
}[company] ?? 'company-avatar--slate')

const getStepMod = (stepName: string, isDone: boolean, isActive: boolean): string => {
  if (stepName === 'Under Review'  && (isDone || isActive)) return 'step--review'
  if (stepName === 'Shortlisted'   && (isDone || isActive)) return 'step--shortlisted'
  if (stepName === 'For Interview' && isActive)             return 'step--interview'
  if (stepName === 'Decided'       && (isDone || isActive)) return 'step--declined'
  return ''
}

// ─────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────

export default function Applications() {

  // ── State ──────────────────────────────
  const [applications, setApplications] = useState<AppItem[]>([])
  const [isLoading, setIsLoading]       = useState(true)
  const [loadError, setLoadError]       = useState<string | null>(null)
  const [searchQuery, setSearchQuery]     = useState('')
  const [statusFilter, setStatusFilter]   = useState('')
  const [jobTypeFilter, setJobTypeFilter] = useState('')
  const [sortOrder, setSortOrder]         = useState('Most Recent')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)

      const result = await applicationService.getMyApplications()
      if (result.isSuccess && result.value) {
        const items: AppItem[] = result.value.map(a => ({
          applicationId: a.applicationId,
          jobListingId: a.jobListingId,
          company: a.companyName,
          role: a.jobTitle,
          status: a.status,
          jobType: a.jobType,
          location: a.location,
          appliedAt: a.appliedAt,
          appliedDate: new Date(a.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          pipelineStage: a.pipelineStage
        }))
        setApplications(items)
      } else {
        setLoadError(result.error || 'Failed to load applications')
        setApplications([])
      }

      setIsLoading(false)
    }

    load()
  }, [])

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setJobTypeFilter('')
    setSortOrder('Most Recent')
  }

  const hasFilters = searchQuery.trim() !== '' || statusFilter !== '' || jobTypeFilter !== ''

  // ── Computed ───────────────────────────
  const filteredApplications = useMemo(() => {
    let result = [...applications]

    if (searchQuery.trim())
      result = result.filter(a =>
        a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.role.toLowerCase().includes(searchQuery.toLowerCase())
      )

    if (statusFilter)   result = result.filter(a => a.status  === statusFilter)
    if (jobTypeFilter)  result = result.filter(a => a.jobType === jobTypeFilter)

    if (sortOrder === 'Oldest')  result = result.reverse()
    if (sortOrder === 'Status')  result = result.sort((a, b) => a.pipelineStage - b.pipelineStage)

    return result
  }, [applications, searchQuery, statusFilter, jobTypeFilter, sortOrder])

  // ── Render ─────────────────────────────
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <PageHeader
          title="My Applications"
          subtitle={`${applications.length} applications — last updated today`}
        >
          <Link to="/browse-jobs" className="btn-browse">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Browse More Jobs
          </Link>
        </PageHeader>

        <div className="applications-body">

          {isLoading && (
            <div className="empty-state">
              <p className="empty-state__title">Loading applications…</p>
              <p className="empty-state__sub">Please wait.</p>
            </div>
          )}

          {!isLoading && loadError && (
            <div className="empty-state">
              <p className="empty-state__title">Failed to load applications</p>
              <p className="empty-state__sub">{loadError}</p>
              <button className="btn-clear-filters" onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}

          {!isLoading && !loadError && (
          <>
          {/* ── Stat Strip ── */}
          <div className="stat-strip">
            <div className="stat-item">
              <span className="stat-item__value">{applications.length}</span>
              <span className="stat-item__label">Total Applied</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-item__value stat-item__value--review">
                {applications.filter(a => a.status === 'Under Review').length}
              </span>
              <span className="stat-item__label">Under Review</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-item__value stat-item__value--shortlisted">
                {applications.filter(a => a.status === 'Shortlisted').length}
              </span>
              <span className="stat-item__label">Shortlisted</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-item__value stat-item__value--interview">
                {applications.filter(a => a.status === 'For Interview').length}
              </span>
              <span className="stat-item__label">For Interview</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-item__value stat-item__value--declined">
                {applications.filter(a => a.status === 'Declined').length}
              </span>
              <span className="stat-item__label">Declined</span>
            </div>
          </div>

          {/* ── Toolbar ── */}
          <div className="toolbar">
            <div className="search-wrap">
              <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search by company or role…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-wrap">
              <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="For Interview">For Interview</option>
                <option value="Declined">Declined</option>
              </select>
              <select className="filter-select" value={jobTypeFilter} onChange={e => setJobTypeFilter(e.target.value)}>
                <option value="">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div className="sort-wrap">
              <span className="sort-label">Sort by</span>
              <select className="filter-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="Most Recent">Most Recent</option>
                <option value="Oldest">Oldest</option>
                <option value="Status">Status</option>
              </select>
            </div>

            {hasFilters && (
              <button className="btn-clear-filters" onClick={clearFilters}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Clear
              </button>
            )}
          </div>

          {/* ── Result Count ── */}
          {filteredApplications.length !== applications.length && (
            <p className="result-count">
              Showing <strong>{filteredApplications.length}</strong> of {applications.length} applications
            </p>
          )}

          {/* ── Application Cards ── */}
          <div className="app-list">
            {filteredApplications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <p className="empty-state__title">No applications found</p>
                <p className="empty-state__sub">Try adjusting your search or filters.</p>
                <button className="btn-clear-filters" onClick={clearFilters}>Clear filters</button>
              </div>
            ) : (
              filteredApplications.map((app, idx) => {
                const badgeClass  = getStatusBadgeClass(app.status)
                const avatarClass = getAvatarClass(app.company)
                const initials    = getInitials(app.company)

                return (
                  <div key={idx} className="app-card">

                    {/* ── Top Row ── */}
                    <div className="app-card__top">
                      <div className="app-card__identity">
                        <div className={`company-avatar ${avatarClass}`}>{initials}</div>
                        <div className="app-card__title-group">
                          <h3 className="app-card__role">{app.role}</h3>
                          <p className="app-card__company">{app.company}</p>
                        </div>
                      </div>
                      <div className="app-card__actions">
                        <span className={`status-badge ${badgeClass}`}>{app.status}</span>
                        <button className="btn-view">View Listing</button>
                      </div>
                    </div>

                    {/* ── Meta Tags ── */}
                    <div className="app-card__meta">
                      <span className="meta-tag meta-tag--type">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                        {app.jobType}
                      </span>
                      <span className="meta-tag">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {app.location}
                      </span>
                      <span className="meta-tag">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Applied {app.appliedDate}
                      </span>
                    </div>

                    {/* ── Pipeline ── */}
                    <div className="pipeline">
                      {PIPELINE_STEPS.map((stepName, stepIdx) => {
                        const isDone    = stepIdx < app.pipelineStage
                        const isActive  = stepIdx === app.pipelineStage
                        const stepMod   = getStepMod(stepName, isDone, isActive)
                        const stepState = isDone ? 'step--done' : isActive ? 'step--active' : ''

                        return (
                          <div key={stepName} className={`pipeline__step ${stepState} ${stepMod}`}>
                            <div className="pipeline__node-row">
                              <div className="pipeline__node">
                                {isDone && (
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </div>
                              {stepIdx < PIPELINE_STEPS.length - 1 && (
                                <div className={`pipeline__line ${isDone ? 'line--done' : ''}`}></div>
                              )}
                            </div>
                            <span className="pipeline__label">{stepName}</span>
                          </div>
                        )
                      })}
                    </div>

                  </div>
                )
              })
            )}
          </div>
          </>
          )}

        </div>
      </main>
    </div>
  )
}
