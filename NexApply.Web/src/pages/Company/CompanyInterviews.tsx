import { useState, useMemo, useEffect } from 'react'
import './CompanyInterviews.css'
import {CompanySidebar} from '../../components/CompanySidebar';
import {CompanyHeader} from '../../components/CompanyHeader';
import { ScheduleInterviewModal } from '../../components/modal/ScheduleInterviewModal';
import { companyInterviewsService } from '../../services/companyInterviewsService';

// ─────────────────────────────────────────
//  INTERFACES
// ─────────────────────────────────────────

interface InterviewItem {
  id: number
  candidateName: string
  jobTitle: string
  scheduledAt: Date
  durationMins: number
  format: string
  status: string
  location: string
  meetingLink: string
  interviewers: string[]
  notes: string
  feedback: string
  rating: number
  recommendation: string
}

// ─────────────────────────────────────────
//  STATIC DATA
// ─────────────────────────────────────────

const today = new Date()
const d = (daysOffset: number, hours: number, mins = 0) => {
  const dt = new Date(today)
  dt.setDate(dt.getDate() + daysOffset)
  dt.setHours(hours, mins, 0, 0)
  return dt
}

const INITIAL_INTERVIEWS: InterviewItem[] = [
  { id:1, candidateName:'Kira Reyes',      jobTitle:'Full-Stack Developer Intern',  scheduledAt:d(0,10),     durationMins:60, format:'Video Call', status:'Scheduled',  location:'',                    meetingLink:'https://meet.google.com/abc-defg', interviewers:['Anna Vidal','Marcus Lee'],              notes:'Focus on React and .NET Core fundamentals.',       feedback:'', rating:0, recommendation:'' },
  { id:2, candidateName:'Sofia Cruz',      jobTitle:'API Developer (.NET)',         scheduledAt:d(0,14,30),  durationMins:45, format:'On-site',    status:'Scheduled',  location:'HQ Conference Room B', meetingLink:'',                                 interviewers:['Anna Vidal','James Ortiz','Patricia Sy'], notes:'Technical panel — system design portion included.',feedback:'', rating:0, recommendation:'' },
  { id:3, candidateName:'Marco Guerrero',  jobTitle:'React Frontend Developer',     scheduledAt:d(2,9),      durationMins:60, format:'Video Call', status:'Scheduled',  location:'',                    meetingLink:'https://zoom.us/j/12345678',        interviewers:['Marcus Lee'],                          notes:'',                                                 feedback:'', rating:0, recommendation:'' },
  { id:4, candidateName:'Rachel Ong',      jobTitle:'API Developer (.NET)',         scheduledAt:d(3,11),     durationMins:90, format:'On-site',    status:'Scheduled',  location:'HQ Conference Room A', meetingLink:'',                                 interviewers:['Anna Vidal','James Ortiz'],             notes:'Senior-level technical assessment.',               feedback:'', rating:0, recommendation:'' },
  { id:5, candidateName:'Ana Villanueva',  jobTitle:'React Frontend Developer',     scheduledAt:d(-3,10),    durationMins:60, format:'Video Call', status:'Completed',  location:'',                    meetingLink:'',                                 interviewers:['Marcus Lee','Patricia Sy'],             notes:'',                                                 feedback:'Strong React skills. Good communication. Needs TypeScript depth.', rating:4, recommendation:'Hire' },
  { id:6, candidateName:'James Tan',       jobTitle:'Full-Stack Developer Intern',  scheduledAt:d(-5,14),    durationMins:45, format:'Phone',      status:'Completed',  location:'',                    meetingLink:'',                                 interviewers:['Anna Vidal'],                          notes:'',                                                 feedback:'Promising candidate but needs more backend exposure. Would work well as intern.', rating:3, recommendation:'Hire' },
  { id:7, candidateName:'Mark David',      jobTitle:'API Developer (.NET)',         scheduledAt:d(-7,9),     durationMins:60, format:'Video Call', status:'No-show',    location:'',                    meetingLink:'https://meet.google.com/xyz-uvwx', interviewers:['James Ortiz'],                         notes:'Candidate did not attend. Attempted contact.',     feedback:'', rating:0, recommendation:'' },
  { id:8, candidateName:'Luis Santos',     jobTitle:'React Frontend Developer',     scheduledAt:d(-2,15),    durationMins:30, format:'Phone',      status:'Cancelled',  location:'',                    meetingLink:'',                                 interviewers:['Marcus Lee'],                          notes:'Candidate withdrew application.',                  feedback:'', rating:0, recommendation:'' },
]
void INITIAL_INTERVIEWS

const TABS = ['All', 'Today', 'Upcoming', 'Completed', 'Cancelled']
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// ─────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const fmtTime = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const fmtTimeRange = (d: Date, mins: number) => {
  const end = new Date(d.getTime() + mins * 60000)
  return `${fmtTime(d)} — ${fmtTime(end)}`
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const fmtMonthYear = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

const fmtGroupLabel = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()

const fmtDayShort = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

const fmtTodayShort = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const statusCss = (status: string) =>
  status.toLowerCase().replace(/-/g, '').replace(/ /g, '')



// ─────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────

export default function CompanyInterviews() {

  // ── State ──────────────────────────────
  const [interviews, setInterviews]         = useState<InterviewItem[]>([])
  const [isLoading, setIsLoading]           = useState(true)
  const [error, setError]                   = useState<string | null>(null)
  const [searchQuery, setSearchQuery]       = useState('')
  const [statusFilter, setStatusFilter]     = useState('')
  const [formatFilter, setFormatFilter]     = useState('')
  const [activeTab, setActiveTab]           = useState('All')
  const [expandedId, setExpandedId]         = useState<number | null>(null)
  const [editingFeedbackId, setEditingFeedbackId] = useState<number | null>(null)
  const [calendarDate, setCalendarDate]     = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedCalDate, setSelectedCalDate] = useState<Date | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [isRescheduleMode, setIsRescheduleMode]   = useState(false)
  const [rescheduleTarget, setRescheduleTarget]   = useState<InterviewItem | null>(null)

  // ── Fetch Interviews ───────────────────
  useEffect(() => {
    const fetchInterviews = async () => {
      setIsLoading(true)
      setError(null)
      const result = await companyInterviewsService.getInterviews()
      
      if (result.isSuccess && result.value) {
        const mappedInterviews: InterviewItem[] = result.value.interviews.map((iv, idx) => ({
          id: idx + 1,
          candidateName: iv.candidateName,
          jobTitle: iv.jobTitle,
          scheduledAt: new Date(iv.scheduledAt),
          durationMins: iv.durationMinutes,
          format: iv.format,
          status: iv.status,
          location: iv.location || '',
          meetingLink: iv.meetingLink || '',
          interviewers: iv.interviewers,
          notes: iv.notes || '',
          feedback: iv.feedback || '',
          rating: iv.rating || 0,
          recommendation: iv.recommendation || ''
        }))
        setInterviews(mappedInterviews)
      } else {
        setError(result.error || 'Failed to load interviews')
      }
      
      setIsLoading(false)
    }

    fetchInterviews()
  }, [])

  // ── Computed counts ────────────────────
  const todayCount     = interviews.filter(i => isSameDay(i.scheduledAt, today) && i.status === 'Scheduled').length
  const upcomingCount  = interviews.filter(i => i.scheduledAt > today && i.status === 'Scheduled').length
  const completedCount = interviews.filter(i => i.status === 'Completed').length
  const cancelledCount = interviews.filter(i => i.status === 'Cancelled' || i.status === 'No-show').length

  const getTabCount = (tab: string) => {
    if (tab === 'Today')     return interviews.filter(i => isSameDay(i.scheduledAt, today)).length
    if (tab === 'Upcoming')  return interviews.filter(i => i.scheduledAt > today && i.status === 'Scheduled').length
    if (tab === 'Completed') return completedCount
    if (tab === 'Cancelled') return cancelledCount
    return interviews.length
  }

  // ── Filtered ───────────────────────────
  const filteredInterviews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return interviews
      .filter(i => {
        const matchSearch = !q || i.candidateName.toLowerCase().includes(q) || i.jobTitle.toLowerCase().includes(q)
        const matchStatus = !statusFilter || i.status === statusFilter
        const matchFormat = !formatFilter || i.format === formatFilter
        const matchCal    = !selectedCalDate || isSameDay(i.scheduledAt, selectedCalDate)
        const matchTab =
          activeTab === 'Today'     ? isSameDay(i.scheduledAt, today) :
          activeTab === 'Upcoming'  ? i.scheduledAt > today && i.status === 'Scheduled' :
          activeTab === 'Completed' ? i.status === 'Completed' :
          activeTab === 'Cancelled' ? i.status === 'Cancelled' || i.status === 'No-show' : true
        return matchSearch && matchStatus && matchFormat && matchCal && matchTab
      })
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
  }, [interviews, searchQuery, statusFilter, formatFilter, selectedCalDate, activeTab])

  // ── Grouped by month ───────────────────
  const groupedInterviews = useMemo(() => {
    const map = new Map<string, { key: Date; items: InterviewItem[] }>()
    filteredInterviews.forEach(i => {
      const key = `${i.scheduledAt.getFullYear()}-${i.scheduledAt.getMonth()}`
      if (!map.has(key)) map.set(key, { key: new Date(i.scheduledAt.getFullYear(), i.scheduledAt.getMonth(), 1), items: [] })
      map.get(key)!.items.push(i)
    })
    return Array.from(map.values()).sort((a, b) => a.key.getTime() - b.key.getTime())
  }, [filteredInterviews])

  // ── Calendar cells ─────────────────────
  const calendarCells = useMemo(() => {
    const cells: (Date | null)[] = []
    const first = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1)
    const days  = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate()
    for (let i = 0; i < first.getDay(); i++) cells.push(null)
    for (let d = 1; d <= days; d++) cells.push(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), d))
    return cells
  }, [calendarDate])

  const hasInterviewOn = (date: Date) => interviews.some(i => isSameDay(i.scheduledAt, date))

  const todayList = interviews
    .filter(i => isSameDay(i.scheduledAt, today))
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())

  // ── Handlers ───────────────────────────
  const toggleExpand = (id: number) => setExpandedId(prev => prev === id ? null : id)

  const updateInterview = (id: number, patch: Partial<InterviewItem>) =>
    setInterviews(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))

  const markComplete     = (iv: InterviewItem) => updateInterview(iv.id, { status: 'Completed' })
  const cancelInterview  = (iv: InterviewItem) => updateInterview(iv.id, { status: 'Cancelled' })

  const openReschedule = (iv: InterviewItem) => {
    setRescheduleTarget(iv)
    setIsRescheduleMode(true)
    setShowScheduleModal(true)
  }

  const closeScheduleModal = () => {
    setShowScheduleModal(false)
    setIsRescheduleMode(false)
    setRescheduleTarget(null)
  }

  const handleConfirmSchedule = async (result: any) => {
    const { interview: form, interviewTime, interviewerName } = result
    const [hours, mins] = interviewTime.split(':').map(Number)
    const scheduledAt = new Date(form.scheduledAt)
    scheduledAt.setHours(hours, mins, 0, 0)

    // Prepare command
    const command = {
      applicationId: undefined,
      studentId: undefined,
      jobListingId: undefined,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: form.durationMins,
      format: form.format,
      location: form.location || undefined,
      meetingLink: form.location || undefined,
      notes: form.notes || undefined,
      interviewerNames: interviewerName ? [interviewerName.trim()] : []
    }

    // Call API
    const apiResult = await companyInterviewsService.scheduleInterview(command)

    if (apiResult.isSuccess && apiResult.value) {
      // Add to local state
      const newId = interviews.length > 0 ? Math.max(...interviews.map(i => i.id)) + 1 : 1
      setInterviews(prev => [...prev, {
        id: newId,
        candidateName: apiResult.value!.candidateName,
        jobTitle: apiResult.value!.jobTitle,
        scheduledAt: new Date(apiResult.value!.scheduledAt),
        durationMins: apiResult.value!.durationMinutes,
        format: apiResult.value!.format,
        status: apiResult.value!.status,
        location: apiResult.value!.location || '',
        meetingLink: apiResult.value!.meetingLink || '',
        interviewers: apiResult.value!.interviewers,
        notes: apiResult.value!.notes || '',
        feedback: '',
        rating: 0,
        recommendation: '',
      }])
      closeScheduleModal()
    } else {
      alert(apiResult.error || 'Failed to schedule interview')
    }
  }

  const selectCalendarDay = (date: Date | null) => {
    if (!date) return
    setSelectedCalDate(prev => prev && isSameDay(prev, date) ? null : date)
  }

  // ── Render ─────────────────────────────
  return (
    <div className="app-shell">
      <CompanySidebar />

      <div className="main-content">
        <CompanyHeader title="Interviews" subtitle="Schedule and manage candidate interviews" />

        <div className="page-body">

          {/* ══ Summary Stats ══ */}
          <div className="summary-stats">
            <div className="stat-chip stat-chip--today">
              <span className="stat-chip-dot"></span>
              <span className="stat-chip-value">{todayCount}</span>
              <span className="stat-chip-label">Today</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-chip stat-chip--upcoming">
              <span className="stat-chip-dot"></span>
              <span className="stat-chip-value">{upcomingCount}</span>
              <span className="stat-chip-label">Upcoming</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-chip stat-chip--completed">
              <span className="stat-chip-dot"></span>
              <span className="stat-chip-value">{completedCount}</span>
              <span className="stat-chip-label">Completed</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-chip stat-chip--cancelled">
              <span className="stat-chip-dot"></span>
              <span className="stat-chip-value">{cancelledCount}</span>
              <span className="stat-chip-label">Cancelled</span>
            </div>
            <div className="stat-actions">
              <button className="btn-secondary" onClick={() => { setIsRescheduleMode(false); setShowScheduleModal(true) }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Schedule Interview
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
              <div style={{ fontSize: '14px' }}>Loading interviews...</div>
            </div>
          ) : error ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#DC2626' }}>
              <div style={{ fontSize: '14px', marginBottom: '12px' }}>{error}</div>
              <button className="btn-secondary" onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : (
            <>
          {/* ══ Main Layout ══ */}
          <div className="interviews-layout">

            {/* ── Left Aside: Mini Calendar + Today's Schedule ── */}
            <aside className="interviews-aside">

              {/* Mini Calendar */}
              <div className="mini-calendar">
                <div className="cal-nav">
                  <button className="cal-nav-btn" onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} aria-label="Previous month">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <span className="cal-month-label">{fmtMonthYear(calendarDate)}</span>
                  <button className="cal-nav-btn" onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} aria-label="Next month">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>

                <div className="cal-grid">
                  {DAY_HEADERS.map(day => <div key={day} className="cal-day-header">{day}</div>)}
                  {calendarCells.map((cell, idx) => (
                    <button
                      key={idx}
                      className={[
                        'cal-day',
                        !cell ? 'cal-day--empty' : '',
                        cell && isSameDay(cell, today) ? 'cal-day--today' : '',
                        cell && selectedCalDate && isSameDay(cell, selectedCalDate) ? 'cal-day--selected' : '',
                        cell && hasInterviewOn(cell) ? 'cal-day--has-event' : '',
                      ].join(' ')}
                      onClick={() => selectCalendarDay(cell)}
                      disabled={!cell}
                      aria-label={cell ? cell.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : ''}
                    >
                      {cell ? cell.getDate() : ''}
                      {cell && hasInterviewOn(cell) && <span className="cal-event-dot"></span>}
                    </button>
                  ))}
                </div>

                {selectedCalDate && (
                  <button className="cal-clear-btn" onClick={() => setSelectedCalDate(null)}>
                    Clear date filter
                  </button>
                )}
              </div>

              {/* Today's Schedule */}
              <div className="today-panel">
                <div className="today-panel-header">
                  <span className="today-panel-title">Today's Schedule</span>
                  <span className="today-panel-date">{fmtTodayShort(today)}</span>
                </div>
                {todayList.length === 0 ? (
                  <p className="today-empty">No interviews scheduled today.</p>
                ) : (
                  <div className="today-list">
                    {todayList.map(iv => (
                      <div key={iv.id} className="today-item">
                        <div className="today-time">
                          <span className="today-time-val">{iv.scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).split(' ')[0]}</span>
                          <span className="today-time-ampm">{iv.scheduledAt.getHours() >= 12 ? 'PM' : 'AM'}</span>
                        </div>
                        <div className="today-item-info">
                          <span className="today-name">{iv.candidateName}</span>
                          <span className="today-role">{iv.jobTitle}</span>
                        </div>
                        <span className={`today-type-badge today-type-badge--${iv.format.toLowerCase().replace(/ /g, '')}`}>
                          {iv.format}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </aside>

            {/* ── Right: Interview List ── */}
            <div className="interviews-main">

              {/* Filter Bar */}
              <div className="filter-bar">
                <div className="search-wrap">
                  <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    className="search-input"
                    type="search"
                    placeholder="Search by candidate or position..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="filter-controls">
                  <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="No-show">No-show</option>
                  </select>
                  <select className="filter-select" value={formatFilter} onChange={e => setFormatFilter(e.target.value)}>
                    <option value="">All Formats</option>
                    <option value="Video Call">Video Call</option>
                    <option value="On-site">On-site</option>
                    <option value="Phone">Phone</option>
                  </select>
                </div>
              </div>

              {/* Tab Strip */}
              <div className="tab-strip">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                    <span className="tab-count">{getTabCount(tab)}</span>
                  </button>
                ))}
              </div>

              {/* Interview Cards */}
              {filteredInterviews.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <p className="empty-title">No interviews found</p>
                  <p className="empty-sub">Try changing your filters or schedule a new interview.</p>
                  <button className="btn-secondary" onClick={() => { setIsRescheduleMode(false); setShowScheduleModal(true) }}>
                    Schedule Interview
                  </button>
                </div>
              ) : (
                <div className="interview-list">
                  {groupedInterviews.map(({ key, items }) => (
                    <div key={key.toISOString()}>
                      {/* Date Group Header */}
                      <div className="date-group-header">
                        <span className="date-group-label">{fmtGroupLabel(key)}</span>
                        <div className="date-group-line"></div>
                        <span className="date-group-count">{items.length}</span>
                      </div>

                      {items.map(iv => {
                        const isExpanded = expandedId === iv.id
                        const isToday    = isSameDay(iv.scheduledAt, today)

                        return (
                          <div
                            key={iv.id}
                            className={[
                              'interview-card',
                              `interview-card--${statusCss(iv.status)}`,
                              isExpanded ? 'expanded' : '',
                              isToday && iv.status === 'Scheduled' ? 'interview-card--today' : '',
                            ].join(' ')}
                          >
                            {/* Card Header Row */}
                            <div className="interview-card-main" onClick={() => toggleExpand(iv.id)}>

                              <div className="iv-time-col">
                                <span className="iv-time">{fmtTime(iv.scheduledAt)}</span>
                                <span className="iv-duration">· {iv.durationMins} min</span>
                              </div>

                              <div className="iv-candidate">
                                <span className="iv-name">{iv.candidateName}</span>
                                <span className="iv-role">· {iv.jobTitle}</span>
                              </div>

                              <div className="iv-format">
                                <span className="format-badge">{iv.format}</span>        
                              </div>

                              <div className="iv-date">
                                <span className="iv-date-day">{fmtDayShort(iv.scheduledAt)}</span>
                              </div>

                              <div className="iv-right" onClick={e => e.stopPropagation()}>
                                <button className="expand-toggle" aria-label={`${isExpanded ? 'Collapse' : 'Expand'} interview`}>
                                  <svg className={`chevron ${isExpanded ? 'rotated' : ''}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Expanded Panel */}
                            {isExpanded && (
                              <div className="interview-detail">
                                <div className="interview-detail-grid">

                                  {/* Col 1: Interview Details */}
                                  <div className="detail-col">
                                    <span className="detail-label">
                                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                      </svg>
                                      Interview Details
                                    </span>
                                    <div className="detail-info-grid">
                                      <span className="di-key">Date</span>
                                      <span className="di-val">{fmtDate(iv.scheduledAt)}</span>
                                      <span className="di-key">Time</span>
                                      <span className="di-val">{fmtTimeRange(iv.scheduledAt, iv.durationMins)}</span>
                                      <span className="di-key">Format</span>
                                      <span className="di-val">{iv.format}</span>
                                      {iv.location && <>
                                        <span className="di-key">Location</span>
                                        <span className="di-val">{iv.location}</span>
                                      </>}
                                      {iv.meetingLink && <>
                                        <span className="di-key">Link</span>
                                        <span className="di-val">
                                          <a href={iv.meetingLink} target="_blank" rel="noreferrer" className="detail-link">{iv.meetingLink}</a>
                                        </span>
                                      </>}
                                    </div>
                                  </div>

                                  <div className="detail-divider-v"></div>

                                  {/* Col 2: Interviewers */}
                                  <div className="detail-col">
                                    <span className="detail-label">
                                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                      </svg>
                                      Interview Panel
                                    </span>
                                    <div className="interviewer-list">
                                      {iv.interviewers.map(person => (
                                        <div key={person} className="interviewer-row">
                                          <div className="interviewer-avatar">{person[0]}</div>
                                          <span className="interviewer-name">{person}</span>
                                        </div>
                                      ))}
                                    </div>
                                    {iv.notes && (
                                      <div className="detail-notes-block">
                                        <span className="di-key">Notes</span>
                                        <p className="detail-notes-text">{iv.notes}</p>
                                      </div>
                                    )}
                                    {iv.status === 'Completed' && iv.feedback && (
                                      <div className="detail-notes-block">
                                        <span className="di-key">Feedback</span>
                                        <p className="detail-notes-text">{iv.feedback}</p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="detail-divider-v"></div>

                                  {/* Col 3: Feedback or Prep Notes */}
                                  <div className="detail-col">
                                    {iv.status === 'Completed' ? (
                                      <>
                                        <span className="detail-label">
                                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                          </svg>
                                          Interview Feedback
                                        </span>
                                        {iv.feedback && editingFeedbackId !== iv.id ? (
                                          <div className="feedback-display">
                                            <p className="feedback-display-text">{iv.feedback}</p>
                                            <button className="feedback-edit-btn" onClick={() => setEditingFeedbackId(iv.id)} title="Edit feedback">
                                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                              </svg>
                                            </button>
                                          </div>
                                        ) : (
                                          <textarea
                                            className="feedback-textarea"
                                            placeholder="Rate the candidate — strengths, areas for improvement, hire recommendation..."
                                            value={iv.feedback}
                                            onChange={e => updateInterview(iv.id, { feedback: e.target.value })}
                                            onBlur={() => setEditingFeedbackId(null)}
                                            rows={5}
                                          />
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <span className="detail-label">
                                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                          </svg>
                                          Prep Notes
                                        </span>
                                        <textarea
                                          className="feedback-textarea"
                                          placeholder="Notes for the interview panel, topics to cover, or questions to ask..."
                                          value={iv.notes}
                                          onChange={e => updateInterview(iv.id, { notes: e.target.value })}
                                          rows={5}
                                        />
                                        <div className="detail-quick-actions">
                                          <span className={`status-badge status-badge--${statusCss(iv.status)}`}>
                                            <span className="status-dot"></span>
                                            {iv.status}
                                          </span>
                                          <button className="qbtn qbtn--complete" onClick={() => markComplete(iv)}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                              <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            Mark as Completed
                                          </button>
                                          <button className="qbtn qbtn--reschedule" onClick={() => openReschedule(iv)}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.3" />
                                            </svg>
                                            Reschedule
                                          </button>
                                          <button className="qbtn qbtn--cancel" onClick={() => cancelInterview(iv)}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <circle cx="12" cy="12" r="10" />
                                              <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                                            </svg>
                                            Cancel Interview
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>

                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </>
          )}
        </div>
      </div>

      {/* ══ Schedule / Reschedule Modal ══ */}
      <ScheduleInterviewModal
        isVisible={showScheduleModal}
        isRescheduleMode={isRescheduleMode}
        interview={rescheduleTarget ? {
          candidateName: rescheduleTarget.candidateName,
          jobTitle: rescheduleTarget.jobTitle,
          scheduledAt: rescheduleTarget.scheduledAt.toISOString().split('T')[0],
          durationMins: rescheduleTarget.durationMins,
          format: rescheduleTarget.format,
          location: rescheduleTarget.location,
          notes: rescheduleTarget.notes,
        } : undefined}
        interviewTime={rescheduleTarget
          ? `${String(rescheduleTarget.scheduledAt.getHours()).padStart(2,'0')}:${String(rescheduleTarget.scheduledAt.getMinutes()).padStart(2,'0')}`
          : '10:00'}
        interviewerName={rescheduleTarget?.interviewers?.[0] ?? ''}
        onClose={closeScheduleModal}
        onConfirm={handleConfirmSchedule}
      />

    </div>
  )
}
