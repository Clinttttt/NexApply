import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './Applications.css'
import {Sidebar} from '@/shared/components/Sidebar'
import {PageHeader} from '@/shared/components/PageHeader'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import { applicationService } from '@/shared/api/applicationService'
import { ApplicationsSkeleton } from './ApplicationsSkeleton'

interface AppItem {
  applicationId: string
  jobListingId: string
  company: string
  role: string
  status: string
  jobType: string
  location: string
  appliedAt: string
  appliedDate: string
  pipelineStage: number
}

const PIPELINE_STEPS = ['Submitted', 'Under Review', 'Shortlisted', 'For Interview', 'Decided']
const STATUS_LABELS: Record<string, string> = {
  '0': 'Submitted',
  '1': 'Under Review',
  '2': 'Shortlisted',
  '3': 'For Interview',
  '4': 'Declined',
  '5': 'Decided',
  Submitted: 'Submitted',
  UnderReview: 'Under Review',
  Shortlisted: 'Shortlisted',
  ForInterview: 'For Interview',
  Declined: 'Declined',
  Decided: 'Decided',
}
const STATUS_PIPELINE_STAGES: Record<string, number> = {
  'Submitted': 0,
  'Under Review': 1,
  'Shortlisted': 2,
  'For Interview': 3,
  'Declined': 4,
  'Decided': 4,
}

const getStatusBadgeClass = (status: string): string => ({
  'Submitted':    'status-badge--submitted',
  'Under Review': 'status-badge--review',
  'Shortlisted':  'status-badge--shortlisted',
  'For Interview':'status-badge--interview',
  'Declined':     'status-badge--declined',
  'Decided':      'status-badge--decided',
}[status] ?? '')

const normalizeStatus = (status: unknown): string => {
  const key = String(status ?? '')
  return STATUS_LABELS[key] ?? key
}

const normalizePipelineStage = (status: string, pipelineStage: unknown): number => {
  if (status in STATUS_PIPELINE_STAGES) return STATUS_PIPELINE_STAGES[status]

  const numericStage = Number(pipelineStage)
  return Number.isInteger(numericStage) && numericStage >= 0 && numericStage < PIPELINE_STEPS.length
    ? numericStage
    : 0
}

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
  if (stepName === 'For Interview' && (isDone || isActive)) return 'step--interview'
  if (stepName === 'Decided'       && (isDone || isActive)) return 'step--decided'
  return ''
}

export default function Applications() {
  const [applications, setApplications] = useState<AppItem[]>([])
  const [isLoading, setIsLoading]       = useState(true)
  const [loadError, setLoadError]       = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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
        const items: AppItem[] = result.value.map(a => {
          const status = normalizeStatus(a.status)
          return {
            applicationId: a.applicationId,
            jobListingId: a.jobListingId,
            company: a.companyName,
            role: a.jobTitle,
            status,
            jobType: a.jobType,
            location: a.location,
            appliedAt: a.appliedAt,
            appliedDate: new Date(a.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            pipelineStage: normalizePipelineStage(status, a.pipelineStage)
          }
        })
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

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="main-content">
        <PageHeader
          title="My Applications"
          subtitle={`${applications.length} applications — last updated today`}
          onMenuToggle={() => setIsSidebarOpen(v => !v)}
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
            <ApplicationsSkeleton />
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
              <span className="stat-item__value stat-item__value--decided">
                {applications.filter(a => a.status === 'Decided').length}
              </span>
              <span className="stat-item__label">Decided</span>
            </div>
          </div>

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
              <CustomDropdown
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'Submitted', label: 'Submitted' },
                  { value: 'Under Review', label: 'Under Review' },
                  { value: 'Shortlisted', label: 'Shortlisted' },
                  { value: 'For Interview', label: 'For Interview' },
                  { value: 'Declined', label: 'Declined' },
                  { value: 'Decided', label: 'Decided' },
                ]}
                value={statusFilter}
                onChange={(val) => setStatusFilter(val as string)}
                className="filter-select"
              />
              <CustomDropdown
                options={[
                  { value: '', label: 'All Job Types' },
                  { value: 'Full-time', label: 'Full-time' },
                  { value: 'Part-time', label: 'Part-time' },
                  { value: 'Internship', label: 'Internship' },
                  { value: 'Contract', label: 'Contract' },
                ]}
                value={jobTypeFilter}
                onChange={(val) => setJobTypeFilter(val as string)}
                className="filter-select"
              />
            </div>

            <div className="sort-wrap">
              <span className="sort-label">Sort by</span>
              <CustomDropdown
                options={[
                  { value: 'Most Recent', label: 'Most Recent' },
                  { value: 'Oldest', label: 'Oldest' },
                  { value: 'Status', label: 'Status' },
                ]}
                value={sortOrder}
                onChange={(val) => setSortOrder(val as string)}
                className="filter-select"
              />
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

          {filteredApplications.length !== applications.length && (
            <p className="result-count">
              Showing <strong>{filteredApplications.length}</strong> of {applications.length} applications
            </p>
          )}

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

                    <div className="app-card__top">
                      <div className="app-card__identity">
                        <div className={`company-avatar ${avatarClass}`}>{initials}</div>
                        <div className="app-card__title-group">
                          <h3 className="app-card__role">{app.role}</h3>
                          <p className="app-card__company">{app.company}</p>
                        </div>
                      </div>
                      <div className="app-card__actions">
                        <span className={`status-badge ${badgeClass}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>

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
