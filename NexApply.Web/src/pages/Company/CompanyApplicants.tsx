import { useState, useMemo } from 'react'
import './CompanyApplicants.css'
import {CompanySidebar} from '../../components/CompanySidebar';
import {CompanyHeader} from '../../components/CompanyHeader';
import { ScheduleInterviewModal } from '../../components/modal/ScheduleInterviewModal';

// ─────────────────────────────────────────
//  INTERFACES
// ─────────────────────────────────────────

interface JobItem {
  id: number
  title: string
  type: string
  location: string
  requiredSkills: string[]
}

interface ApplicantItem {
  id: number
  jobId: number
  name: string
  email: string
  stage: string
  matchScore: number
  appliedDate: Date
  education: string
  experience: string
  location: string
  portfolio: string
  phone: string
  linkedIn: string
  gitHub: string
  notes: string
  skills: string[]
}

interface StageStyle {
  cssClass: string
}

// ─────────────────────────────────────────
//  STATIC DATA
// ─────────────────────────────────────────

const STAGES: Record<string, StageStyle> = {
  'Submitted':    { cssClass: 'submitted' },
  'Under Review': { cssClass: 'review' },
  'Shortlisted':  { cssClass: 'shortlisted' },
  'For Interview':{ cssClass: 'interview' },
  'Declined':     { cssClass: 'declined' },
}

const JOBS: JobItem[] = [
  { id: 1, title: 'Full-Stack Developer Intern', type: 'Internship', location: 'Remote',  requiredSkills: ['React', 'ASP.NET Core', 'SQL', 'Git'] },
  { id: 2, title: 'React Frontend Developer',    type: 'Internship', location: 'Remote',  requiredSkills: ['React', 'TypeScript', 'TailwindCSS', 'Figma'] },
  { id: 3, title: 'API Developer (.NET)',         type: 'FullTime',   location: 'Hybrid',  requiredSkills: ['ASP.NET Core', 'PostgreSQL', 'Docker', 'Redis'] },
  { id: 4, title: '.NET Core Developer',         type: 'FullTime',   location: 'On-site', requiredSkills: ['C#', '.NET Core', 'EF Core', 'Azure'] },
]

const INITIAL_APPLICANTS: ApplicantItem[] = [
  { id:1,  jobId:1, name:'Kira Reyes',      email:'kira.reyes@email.com',    stage:'Under Review', matchScore:91, appliedDate:new Date(2025,3,9),  education:'B.S. Computer Science, UP Diliman',    experience:'2 years (internships)', location:'Quezon City, PH',   portfolio:'kirareyes.dev',  phone:'+63 912 345 6789', linkedIn:'https://linkedin.com/in/kirareyes',      gitHub:'https://github.com/kirareyes',      notes:'', skills:['React','ASP.NET Core','SQL','TypeScript','Git'] },
  { id:2,  jobId:1, name:'Marco Guerrero',  email:'marco.g@email.com',       stage:'Shortlisted',  matchScore:85, appliedDate:new Date(2025,3,8),  education:'B.S. Information Technology, DLSU',    experience:'1 year',               location:'Manila, PH',        portfolio:'',               phone:'+63 917 234 5678', linkedIn:'https://linkedin.com/in/marcoguerrero',  gitHub:'',                                  notes:'Strong portfolio. Good culture fit.', skills:['React','SQL','Git','Node.js'] },
  { id:3,  jobId:1, name:'Sofia Cruz',      email:'sofia.cruz@email.com',    stage:'For Interview',matchScore:78, appliedDate:new Date(2025,3,7),  education:'B.S. Computer Engineering, Ateneo',    experience:'3 years',              location:'Pasig, PH',         portfolio:'sofiadev.io',    phone:'+63 918 345 6789', linkedIn:'https://linkedin.com/in/sofiacruz',      gitHub:'https://github.com/sofiacruz',      notes:'', skills:['ASP.NET Core','SQL','Docker','Git'] },
  { id:4,  jobId:1, name:'James Tan',       email:'james.tan@email.com',     stage:'Submitted',    matchScore:62, appliedDate:new Date(2025,3,7),  education:'B.S. Computer Science, UST',           experience:'Fresh graduate',       location:'Mandaluyong, PH',   portfolio:'',               phone:'',                 linkedIn:'',                                       gitHub:'https://github.com/jamestan',       notes:'', skills:['React','HTML','CSS','Git'] },
  { id:5,  jobId:2, name:'Ana Villanueva',  email:'ana.v@email.com',         stage:'Under Review', matchScore:88, appliedDate:new Date(2025,3,6),  education:'B.S. Computer Science, UP Manila',     experience:'2 years',              location:'Taguig, PH',        portfolio:'anadev.ph',      phone:'+63 919 456 7890', linkedIn:'https://linkedin.com/in/anavillanueva',  gitHub:'https://github.com/anavillanueva',  notes:'', skills:['React','TypeScript','TailwindCSS','Figma','CSS'] },
  { id:6,  jobId:2, name:'Luis Santos',     email:'luis.santos@email.com',   stage:'Shortlisted',  matchScore:74, appliedDate:new Date(2025,3,5),  education:'B.S. IT, FEU',                         experience:'1.5 years',            location:'Makati, PH',        portfolio:'',               phone:'+63 920 567 8901', linkedIn:'https://linkedin.com/in/luissantos',     gitHub:'',                                  notes:'Needs TypeScript training.', skills:['React','Figma','CSS','JavaScript'] },
  { id:7,  jobId:3, name:'Rachel Ong',      email:'rachel.ong@email.com',    stage:'Submitted',    matchScore:95, appliedDate:new Date(2025,3,4),  education:'B.S. Computer Science, DLSU',          experience:'4 years',              location:'BGC, PH',           portfolio:'racheldev.com',  phone:'+63 921 678 9012', linkedIn:'https://linkedin.com/in/rachelong',      gitHub:'https://github.com/rachelong',      notes:'Exceptional profile.', skills:['ASP.NET Core','PostgreSQL','Docker','Redis','Kubernetes'] },
  { id:8,  jobId:3, name:'Mark David',      email:'mark.david@email.com',    stage:'Declined',     matchScore:44, appliedDate:new Date(2025,3,3),  education:'B.S. IT, Mapua',                       experience:'6 months',             location:'Caloocan, PH',      portfolio:'',               phone:'+63 922 789 0123', linkedIn:'',                                       gitHub:'',                                  notes:'Insufficient experience for senior role.', skills:['ASP.NET Core','SQL'] },
  { id:9,  jobId:4, name:'Claire Bautista', email:'claire.b@email.com',      stage:'For Interview',matchScore:89, appliedDate:new Date(2025,3,2),  education:'B.S. Computer Science, Ateneo',        experience:'5 years',              location:'Pasig, PH',         portfolio:'',               phone:'+63 923 890 1234', linkedIn:'https://linkedin.com/in/clairebautista',gitHub:'https://github.com/clairebautista',  notes:'', skills:['C#','.NET Core','EF Core','Azure','Docker'] },
  { id:10, jobId:4, name:'Jeric Lim',       email:'jeric.lim@email.com',     stage:'Under Review', matchScore:71, appliedDate:new Date(2025,3,1),  education:'B.S. IT, PLM',                         experience:'3 years',              location:'Manila, PH',        portfolio:'jericlim.dev',   phone:'+63 924 901 2345', linkedIn:'https://linkedin.com/in/jericlim',       gitHub:'https://github.com/jericlim',       notes:'', skills:['C#','.NET Core','SQL','Git'] },
]

// ─────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────

const getInitials = (name: string) =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('')

const getMatchClass = (score: number) =>
  score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low'

const getAvatarColor = (id: number) =>
  ['blue', 'green', 'amber', 'slate', 'purple'][id % 5]

const formatType = (type: string) =>
  type === 'FullTime' ? 'Full-Time' : type === 'PartTime' ? 'Part-Time' : type

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

// ─────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────

export default function CompanyApplicants() {

  // ── State ──────────────────────────────
  const [applicants, setApplicants]           = useState<ApplicantItem[]>(INITIAL_APPLICANTS)
  const [selectedJobId, setSelectedJobId]     = useState<number | null>(null)
  const [searchQuery, setSearchQuery]         = useState('')
  const [sortBy, setSortBy]                   = useState('newest')
  const [activeStageFilter, setActiveStageFilter] = useState('')
  const [bulkStageTarget, setBulkStageTarget] = useState('')
  const [expandedId, setExpandedId]           = useState<number | null>(null)
  const [selectedIds, setSelectedIds]         = useState<Set<number>>(new Set())
  const [showListingsDrop, setShowListingsDrop] = useState(false)

  // Modals
  const [showResumeModal, setShowResumeModal]             = useState(false)
  const [resumeApplicant, setResumeApplicant]             = useState<ApplicantItem | null>(null)
  const [showStageModal, setShowStageModal]               = useState(false)
  const [stageApplicant, setStageApplicant]               = useState<ApplicantItem | null>(null)
  const [showScheduleModal, setShowScheduleModal]         = useState(false)
  const [scheduleApplicant, setScheduleApplicant]         = useState<ApplicantItem | null>(null)

  const activeJob = JOBS.find(j => j.id === selectedJobId) ?? null

  // ── Filtered + Sorted ──────────────────
  const filteredApplicants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let result = applicants.filter(a =>
      (selectedJobId === null || a.jobId === selectedJobId) &&
      (activeStageFilter === '' || a.stage === activeStageFilter) &&
      (q === '' || a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.skills.some(s => s.toLowerCase().includes(q)))
    )
    if (sortBy === 'name')    result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'oldest')  result = [...result].sort((a, b) => a.appliedDate.getTime() - b.appliedDate.getTime())
    if (sortBy === 'newest')  result = [...result].sort((a, b) => b.appliedDate.getTime() - a.appliedDate.getTime())
    if (sortBy === 'match')   result = [...result].sort((a, b) => b.matchScore - a.matchScore)
    return result
  }, [applicants, selectedJobId, activeStageFilter, searchQuery, sortBy])

  // ── Stage update helper ─────────────────
  const updateStage = (id: number, stage: string) =>
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, stage } : a))

  const updateNotes = (id: number, notes: string) =>
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, notes } : a))

  // ── Handlers ───────────────────────────
  const toggleExpand = (id: number) =>
    setExpandedId(prev => prev === id ? null : id)

  const toggleSelect = (id: number) =>
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleSelectAll = (checked: boolean) =>
    setSelectedIds(checked ? new Set(filteredApplicants.map(a => a.id)) : new Set())

  const clearSelection = () => { setSelectedIds(new Set()); setBulkStageTarget('') }

  const applyBulkStage = (stage: string) => {
    if (!stage) return
    setApplicants(prev => prev.map(a => selectedIds.has(a.id) ? { ...a, stage } : a))
    clearSelection()
  }

  const quickStage = (app: ApplicantItem, stage: string) =>
    updateStage(app.id, app.stage === stage ? 'Submitted' : stage)

  const selectJobFromDropdown = (id: number | null) => {
    setSelectedJobId(id)
    setExpandedId(null)
    setShowListingsDrop(false)
  }

  // Resume modal
  const openResumeModal  = (app: ApplicantItem) => { setResumeApplicant(app); setShowResumeModal(true) }
  const closeResumeModal = () => { setShowResumeModal(false); setResumeApplicant(null) }

  // Stage action modal
  const openStageModal  = (app: ApplicantItem) => { setStageApplicant(app); setShowStageModal(true) }
  const closeStageModal = () => { setShowStageModal(false); setStageApplicant(null) }

  const moveToStage = (stage: string) => {
    if (!stageApplicant) return
    updateStage(stageApplicant.id, stage)
    closeStageModal()
  }

  const moveToInterviewAndSchedule = () => {
    if (!stageApplicant) return
    updateStage(stageApplicant.id, 'For Interview')
    const app = stageApplicant
    closeStageModal()
    setScheduleApplicant(app)
    setShowScheduleModal(true)
  }

  // Schedule modal
  const openScheduleModal  = (app: ApplicantItem) => { setScheduleApplicant(app); setShowScheduleModal(true) }
  const closeScheduleModal = () => { setShowScheduleModal(false); setScheduleApplicant(null) }

  // ── Render ─────────────────────────────
  return (
    <div className="app-shell">
      <CompanySidebar />

      <div className="main-content">
        <CompanyHeader title="Applicants" subtitle="Review and manage candidates across your listings" />

        <div className="page-body">

          {/* ══ Pipeline Summary ══ */}
          <div className="pipeline-summary">
            <div className="pipeline-stages">
              <button
                className={`pipeline-stage-btn ${activeStageFilter === '' ? 'active' : ''}`}
                onClick={() => setActiveStageFilter('')}
              >
                <span className="psb-count">
                  {applicants.filter(a => selectedJobId === null || a.jobId === selectedJobId).length}
                </span>
                <span className="psb-label">All</span>
              </button>

              {Object.entries(STAGES).map(([stage, style]) => {
                const count = applicants.filter(a =>
                  a.stage === stage && (selectedJobId === null || a.jobId === selectedJobId)
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
                    {JOBS.map(job => {
                      const appCount = applicants.filter(a => a.jobId === job.id).length
                      return (
                        <button
                          key={job.id}
                          className={`listings-dropdown-item ${selectedJobId === job.id ? 'active' : ''}`}
                          onClick={() => selectJobFromDropdown(job.id)}
                        >
                          <div className="ldi-inner">
                            <span className="ldi-title">{job.title}</span>
                            <div className="ldi-meta">
                              <span className="ldi-badge">{formatType(job.type)}</span>
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

              <button className="btn-compact" onClick={() => {}}>
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
                <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A–Z</option>
                  <option value="match">Best Match</option>
                </select>
              </div>

              {selectedIds.size > 0 && (
                <div className="bulk-actions">
                  <span className="bulk-count">{selectedIds.size} selected</span>
                  <select
                    className="filter-select bulk-stage-select"
                    value={bulkStageTarget}
                    onChange={e => { setBulkStageTarget(e.target.value); applyBulkStage(e.target.value) }}
                  >
                    <option value="">Move to stage…</option>
                    {Object.keys(STAGES).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
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
                  const isSelected = selectedIds.has(app.id)
                  const isExpanded = expandedId === app.id
                  const job = JOBS.find(j => j.id === app.jobId) ?? null
                  const missing = job ? job.requiredSkills.filter(r => !app.skills.map(s => s.toLowerCase()).includes(r.toLowerCase())) : []

                  return (
                    <div
                      key={app.id}
                      className={`table-row-wrap ${isExpanded ? 'row-expanded' : ''} ${isSelected ? 'row-selected' : ''}`}
                    >
                      {/* Main Row */}
                      <div className="table-row" onClick={() => toggleExpand(app.id)}>

                        <div className="td td--check" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="row-check"
                            checked={isSelected}
                            onChange={() => toggleSelect(app.id)}
                            aria-label={`Select ${app.name}`}
                          />
                        </div>

                        <div className="td td--applicant">
                          <div className={`applicant-avatar applicant-avatar--${getAvatarColor(app.id)}`}>
                            {getInitials(app.name)}
                          </div>
                          <div className="applicant-info">
                            <span className="applicant-name">{app.name}</span>
                            <span className="applicant-email">{app.email}</span>
                          </div>
                        </div>

                        <div className="td td--job">
                          {job && (
                            <>
                              <span className="position-title">{job.title}</span>
                              <span className="position-type">{formatType(job.type)}</span>
                            </>
                          )}
                        </div>

                        <div className="td td--match">
                          <div className={`match-score match-score--${getMatchClass(app.matchScore)}`}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                            {app.matchScore}%
                          </div>
                        </div>

                        <div className="td td--stage" onClick={e => e.stopPropagation()}>
                          {app.stage === 'For Interview' && (
                            <button className="stage-badge stage-badge--interview" onClick={() => openScheduleModal(app)}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              For Interview
                            </button>
                          )}
                          {app.stage === 'Submitted' && (
                            <button className="stage-badge stage-badge--submitted" onClick={() => updateStage(app.id, 'Under Review')}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                              </svg>
                              Submitted
                            </button>
                          )}
                          {app.stage === 'Under Review' && (
                            <button className="stage-badge stage-badge--review" onClick={() => openStageModal(app)}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                              </svg>
                              Under Review
                            </button>
                          )}
                          {app.stage === 'Shortlisted' && (
                            <button className="stage-badge stage-badge--shortlisted" onClick={() => updateStage(app.id, 'For Interview')}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              Shortlisted
                            </button>
                          )}
                          {app.stage === 'Declined' && (
                            <span className="stage-badge stage-badge--declined stage-badge--disabled">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                              </svg>
                              Declined
                            </span>
                          )}
                        </div>

                        <div className="td td--date">
                          <span className="applied-date">{formatDate(app.appliedDate)}</span>
                          <span className="applied-year">{app.appliedDate.getFullYear()}</span>
                        </div>

                        <div className="td td--actions" onClick={e => e.stopPropagation()}>
                          <a href={`/recruiter/applicants/${app.id}/resume`} className="row-action row-action--resume" title="View Resume">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            Resume
                          </a>
                          <button className="row-action row-action--message" title={`Message ${app.name}`} onClick={() => {}}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            Message
                          </button>
                          <button
                            className="row-action row-action--expand"
                            onClick={() => toggleExpand(app.id)}
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
                                <span className="about-val">{app.location}</span>
                                <span className="about-key">Portfolio</span>
                                <span className="about-val">
                                  {app.portfolio
                                    ? <a href={app.portfolio.startsWith('http') ? app.portfolio : `https://${app.portfolio}`} target="_blank" rel="noreferrer" className="detail-link">{app.portfolio}</a>
                                    : <span className="about-val--empty">Not provided</span>}
                                </span>
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
                                  const matched = job?.requiredSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase()) ?? false
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
                                value={app.notes}
                                onChange={e => updateNotes(app.id, e.target.value)}
                                rows={4}
                              />
                              <div className="detail-quick-actions">
                                <button
                                  className={`qbtn qbtn--shortlist ${app.stage === 'Shortlisted' ? 'active' : ''}`}
                                  onClick={() => quickStage(app, 'Shortlisted')}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                  </svg>
                                  Shortlist
                                </button>
                                <button
                                  className={`qbtn qbtn--interview ${app.stage === 'For Interview' ? 'active' : ''}`}
                                  onClick={() => quickStage(app, 'For Interview')}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                  </svg>
                                  Schedule Interview
                                </button>
                                <button
                                  className={`qbtn qbtn--decline ${app.stage === 'Declined' ? 'active' : ''}`}
                                  onClick={() => quickStage(app, 'Declined')}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                                  </svg>
                                  Decline
                                </button>
                                {app.stage === 'For Interview' && (
                                  <button className="qbtn qbtn--return" onClick={() => updateStage(app.id, 'Shortlisted')}>
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

      {/* ══ Resume Modal ══ */}
      {showResumeModal && resumeApplicant && (
        <div className="modal-overlay" onClick={closeResumeModal}>
          <div className="modal-content modal-content--resume" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-block">
                <h2 className="modal-title">{resumeApplicant.name}'s Resume</h2>
                <p className="modal-subtitle">{resumeApplicant.email}</p>
              </div>
              <button className="modal-close" onClick={closeResumeModal} aria-label="Close modal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body modal-body--resume">
              <div className="resume-viewer">
                <div className="resume-section">
                  <h3 className="resume-section-title">Education</h3>
                  <p className="resume-text">{resumeApplicant.education}</p>
                </div>
                <div className="resume-section">
                  <h3 className="resume-section-title">Experience</h3>
                  <p className="resume-text">{resumeApplicant.experience}</p>
                </div>
                <div className="resume-section">
                  <h3 className="resume-section-title">Skills</h3>
                  <div className="resume-skills">
                    {resumeApplicant.skills.map(s => <span key={s} className="skill-chip">{s}</span>)}
                  </div>
                </div>
                {resumeApplicant.portfolio && (
                  <div className="resume-section">
                    <h3 className="resume-section-title">Portfolio</h3>
                    <a href={resumeApplicant.portfolio} target="_blank" rel="noreferrer" className="detail-link">{resumeApplicant.portfolio}</a>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeResumeModal}>Close</button>
              <button className="btn-primary" onClick={() => {}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Stage Action Modal ══ */}
      {showStageModal && stageApplicant && (
        <div className="modal-overlay" onClick={closeStageModal}>
          <div className="modal-content modal-content--stage-action" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-block">
                <h2 className="modal-title">Move {stageApplicant.name}</h2>
                <p className="modal-subtitle">Current stage: Under Review</p>
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
            </div>
          </div>
        </div>
      )}

     {/* ══ Schedule Interview Modal (reusable) ══ */}
<ScheduleInterviewModal
  isVisible={showScheduleModal}
  interview={scheduleApplicant ? {
    candidateName: scheduleApplicant.name,
    jobTitle: activeJob?.title ?? '',
    scheduledAt: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    durationMins: 60,
    format: '',
    location: '',
    notes: '',
  } : undefined}
  onClose={closeScheduleModal}
  onConfirm={(_result) => closeScheduleModal()}
/>

    </div>
  )
}
