import { useEffect, useState, useMemo } from 'react'
import './BrowseJobs.css'
import {Sidebar} from '../../components/Sidebar'
import {PageHeader} from '../../components/PageHeader'
import { CustomDropdown } from '../../components/ui/CustomDropdown'
import { jobListingService, type StudentBrowseJobDto } from '../../services/jobListingService'
import { applicationService } from '../../services/applicationService'
import { savedJobsService } from '../../services/savedJobsService'
import { lockBodyScroll } from '../../lib/bodyScrollLock'
import { BrowseJobsSkeleton } from './BrowseJobsSkeleton'

// ─────────────────────────────────────────
//  INTERFACES
// ─────────────────────────────────────────

interface JobListing {
  id: string
  title: string
  company: string
  jobType: string
  workSetup: string
  location: string
  matchScore: number
  postedAt: string
  postedDate: string
  applicants: number
  salary: string
  logoText: string
  logoCss: string
  isSaved: boolean
  hasApplied: boolean
  matchedSkills: string[]
  missingSkills: string[]
  description: string[]
  responsibilities: string[]
  requirements: string[]
}

interface FilterOption {
  label: string
  count: number
}

// ─────────────────────────────────────────
//  STATIC DATA
// ─────────────────────────────────────────

const TECH_STACK_CATALOGUE: Record<string, string[]> = {
  'Frontend': ['HTML / CSS', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'Astro', 'Tailwind CSS', 'Bootstrap', 'Sass / SCSS', 'jQuery', 'Alpine.js'],
  'Backend': ['C#', '.NET / ASP.NET Core', 'Blazor', 'Java', 'Spring Boot', 'Python', 'Django', 'Flask', 'FastAPI', 'Node.js', 'Express.js', 'PHP', 'Laravel', 'Ruby on Rails', 'Go', 'Rust', 'Kotlin', 'Elixir'],
  'Database': ['PostgreSQL', 'MySQL', 'SQL Server', 'SQLite', 'MongoDB', 'Redis', 'Supabase', 'Firebase', 'DynamoDB', 'Cassandra', 'Elasticsearch', 'MariaDB', 'CockroachDB'],
  'DevOps & Cloud': ['Docker', 'Kubernetes', 'Azure', 'AWS', 'GCP', 'GitHub Actions', 'CI/CD', 'Terraform', 'Ansible', 'Nginx', 'Linux / Bash', 'Helm', 'Azure DevOps', 'Jenkins', 'ArgoCD'],
  'Mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin (Android)', 'Xamarin', 'Ionic', 'Expo'],
  'APIs & Messaging': ['REST API', 'GraphQL', 'gRPC', 'WebSockets', 'RabbitMQ', 'Kafka', 'SignalR', 'OpenAPI / Swagger', 'OAuth 2.0', 'JWT'],
  'Tools & Other': ['Git', 'GitHub', 'Jira', 'Figma', 'Postman', 'VS Code', 'Vim', 'Bash / Shell', 'PowerShell', 'Agile / Scrum', 'Unit Testing', 'EF Core', 'Dapper', 'MediatR']
}

// ─────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────

const getMatchCss = (score: number) => score >= 90 ? 'excellent' : score >= 80 ? 'good' : 'fair'
const getMatchRingColor = (score: number) => score >= 90 ? '#059669' : score >= 80 ? '#F59E0B' : '#1D4ED8'
const getMatchColorClass = (score: number) => score >= 90 ? 'match-green' : score >= 80 ? 'match-orange' : 'match-blue'

const getPreviewText = (job: JobListing) => {
  const fullText = job.description.join(' ')
  const sentences = fullText.split('. ').filter(Boolean)
  if (sentences.length >= 2) return sentences[0] + '. ' + sentences[1] + '.'
  return fullText.length > 120 ? fullText.substring(0, 120) + '...' : fullText
}

const formatPostedDate = (postedAt: string) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(postedAt))

const getLogoCss = (company: string) => {
  const logoClasses = ['logo-cb', 'logo-sn', 'logo-ll', 'logo-ts', 'logo-nv', 'logo-ap']
  const index = Math.abs([...company].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % logoClasses.length
  return logoClasses[index]
}

const mapBrowseJob = (job: StudentBrowseJobDto): JobListing => ({
  ...job,
  postedDate: formatPostedDate(job.postedAt),
  logoCss: getLogoCss(job.company)
})

const buildFilterOptions = (jobs: JobListing[], labels: string[], selector: (job: JobListing) => string): FilterOption[] =>
  labels.map(label => ({
    label,
    count: jobs.filter(job => selector(job) === label).length
  }))

const buildLocationOptions = (jobs: JobListing[]): FilterOption[] =>
  [...new Set(jobs.map(job => job.location).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map(label => ({
      label,
      count: jobs.filter(job => job.location === label).length
    }))

const normalizeBulletText = (value: string): string => {
  return value
    .replace(/\s+/g, ' ')
    .replace(/,{2,}/g, ',')
    .replace(/^[\s,;:•·\-–—*]+/g, '')
    .replace(/[\s,;:]+$/g, '')
    .trim()
}

// Some backend fields may contain bullet-separated strings inside a single array item.
// This normalizes them into a clean list of bullet lines for the UI.
const normalizeBulletLines = (lines: string[]): string[] => {
  const result: string[] = []

  for (const line of lines ?? []) {
    if (!line) continue

    // Split by common bullet characters and newlines. Avoid splitting on hyphens to not break sentences.
    const parts = line
      .split(/\r?\n|[•·]/g)
      .map(normalizeBulletText)
      .filter(Boolean)

    // If no bullet chars were present, split() will still return [line] so it's safe.
    result.push(...parts)
  }

  return result
}

// ─────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────

export function BrowseJobs() {

  const PAGE_SIZE = 8

  // ── State ──────────────────────────────
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [locationSearch, setLocationSearch] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [minMatchScore, setMinMatchScore] = useState(0)
  const [onlyShowMatched, setOnlyShowMatched] = useState(false)
  const [showSkillPicker, setShowSkillPicker] = useState(false)
  const [skillPickerSearch, setSkillPickerSearch] = useState('')
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null)
  const [applyMessage, setApplyMessage] = useState('')
  const [applyError, setApplyError] = useState('')
  const [selectedJobTypes, setSelectedJobTypes] = useState<Set<string>>(new Set())
  const [selectedSetups, setSelectedSetups] = useState<Set<string>>(new Set())
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set())
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set())
  const [displayedSkills, setDisplayedSkills] = useState<string[]>([
    'C#', '.NET', 'Blazor', 'React', 'PostgreSQL', 'Python', 'TypeScript', 'Vue.js', 'Docker', 'Azure'
  ])

  // Cursor pagination state (server-side)
  const [pageIndex, setPageIndex] = useState(0)
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null])
  const [nextCursors, setNextCursors] = useState<(string | null)[]>([])
  const [hasMore, setHasMore] = useState(false)

  // ── Computed ───────────────────────────
  useEffect(() => {
    if (!isFiltersOpen) return;
    return lockBodyScroll();
  }, [isFiltersOpen]);

  useEffect(() => {
    if (!isFiltersOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFiltersOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFiltersOpen]);

  useEffect(() => {
    const loadJobs = async () => {
      setIsLoadingJobs(true)
      setLoadError(null)

      const cursor = cursorStack[pageIndex] ?? null
      const result = await jobListingService.getStudentBrowseJobs({ cursor, pageSize: PAGE_SIZE })

      if (result.isSuccess && result.value) {
        const loadedJobs = (result.value.items ?? []).map(mapBrowseJob)
        setJobs(loadedJobs)
        setSelectedJob(loadedJobs[0] ?? null)

        const resumeSkills = loadedJobs.flatMap(job => job.matchedSkills)
        if (resumeSkills.length > 0) {
          setDisplayedSkills(prev => [...new Set([...prev, ...resumeSkills])])
        }

        const next = result.value.nextCursor ?? null
        setHasMore(!!result.value.hasMore)
        setNextCursors(prev => {
          const copy = [...prev]
          copy[pageIndex] = next
          return copy
        })
      } else {
        setLoadError(result.error || 'Failed to load matched jobs')
        setJobs([])
        setSelectedJob(null)
        setHasMore(false)
      }

      setIsLoadingJobs(false)
    }

    loadJobs()
  }, [pageIndex, cursorStack])

  const canGoPrev = pageIndex > 0
  const canGoNext = hasMore && !!nextCursors[pageIndex]

  const goPrev = () => {
    if (!canGoPrev) return
    setPageIndex(i => Math.max(0, i - 1))
  }

  const goNext = () => {
    if (!canGoNext) return

    const nextCursor = nextCursors[pageIndex] ?? null
    setCursorStack(prev => {
      const copy = [...prev]
      if (copy.length <= pageIndex + 1) copy.push(nextCursor)
      else copy[pageIndex + 1] = nextCursor
      return copy
    })
    setPageIndex(i => i + 1)
  }

  const jobTypeOptions = useMemo(() =>
    buildFilterOptions(jobs, ['Full-time', 'Internship', 'Part-time', 'Contract', 'Freelance'], job => job.jobType),
    [jobs]
  )

  const workSetupOptions = useMemo(() =>
    buildFilterOptions(jobs, ['Remote', 'On-site', 'Hybrid'], job => job.workSetup),
    [jobs]
  )

  const locationOptions = useMemo(() => buildLocationOptions(jobs), [jobs])

  const filteredLocationOptions = useMemo(() =>
    locationSearch.trim() === ''
      ? locationOptions
      : locationOptions.filter(l => l.label.toLowerCase().includes(locationSearch.toLowerCase())),
    [locationSearch, locationOptions]
  )

  const filteredSkillCategories = useMemo(() => {
    if (!skillPickerSearch.trim()) return TECH_STACK_CATALOGUE
    const result: Record<string, string[]> = {}
    for (const [cat, skills] of Object.entries(TECH_STACK_CATALOGUE)) {
      const filtered = skills.filter(s => s.toLowerCase().includes(skillPickerSearch.toLowerCase()))
      if (filtered.length > 0) result[cat] = filtered
    }
    return result
  }, [skillPickerSearch])

  const activeFilterChips = useMemo(() => {
    const chips: string[] = []
    chips.push(...selectedJobTypes)
    chips.push(...selectedSetups)
    chips.push(...selectedLocations)
    chips.push(...selectedSkills)
    if (minMatchScore > 0) chips.push(`Match >= ${minMatchScore}%`)
    return chips
  }, [selectedJobTypes, selectedSetups, selectedLocations, selectedSkills, minMatchScore])

  const filteredJobs = useMemo(() => {
    let q = jobs as JobListing[]
    if (searchQuery.trim())
      q = q.filter(j =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.matchedSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    if (selectedJobTypes.size > 0) q = q.filter(j => selectedJobTypes.has(j.jobType))
    if (selectedSetups.size > 0) q = q.filter(j => selectedSetups.has(j.workSetup))
    if (selectedLocations.size > 0) q = q.filter(j => selectedLocations.has(j.location))
    if (selectedSkills.size > 0)
      q = q.filter(j => [...selectedSkills].some(s =>
        j.matchedSkills.map(x => x.toLowerCase()).includes(s.toLowerCase()) ||
        j.missingSkills.map(x => x.toLowerCase()).includes(s.toLowerCase())
      ))
    if (minMatchScore > 0) q = q.filter(j => j.matchScore >= minMatchScore)
    if (onlyShowMatched) q = q.filter(j => j.matchScore > 0)
    return q
  }, [jobs, searchQuery, selectedJobTypes, selectedSetups, selectedLocations, selectedSkills, minMatchScore, onlyShowMatched])

  const sortedFilteredJobs = useMemo(() => {
    const list = [...filteredJobs]
    if (sortBy === 'match') return list.sort((a, b) => b.matchScore - a.matchScore)
    if (sortBy === 'company') return list.sort((a, b) => a.company.localeCompare(b.company))
    return list.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
  }, [filteredJobs, sortBy])

  // ── Handlers ───────────────────────────
  const ensureSelectedJobVisible = (filtered: JobListing[]) => {
    if (selectedJob && !filtered.some(j => j.id === selectedJob.id))
      setSelectedJob(filtered[0] ?? null)
  }

  const toggleSet = (set: Set<string>, val: string): Set<string> => {
    const next = new Set(set)
    if (next.has(val)) {
      next.delete(val)
    } else {
      next.add(val)
    }
    return next
  }

  const toggleJobType = (label: string) => {
    const next = toggleSet(selectedJobTypes, label)
    setSelectedJobTypes(next)
    ensureSelectedJobVisible(filteredJobs)
  }

  const toggleSetup = (label: string) => {
    const next = toggleSet(selectedSetups, label)
    setSelectedSetups(next)
    ensureSelectedJobVisible(filteredJobs)
  }

  const toggleLocation = (label: string) => {
    const next = toggleSet(selectedLocations, label)
    setSelectedLocations(next)
    ensureSelectedJobVisible(filteredJobs)
  }

  const toggleSkill = (skill: string) => {
    const next = toggleSet(selectedSkills, skill)
    setSelectedSkills(next)
    ensureSelectedJobVisible(filteredJobs)
  }

  const addSkillFromPicker = (skill: string) => {
    if (!displayedSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase()))
      setDisplayedSkills(prev => [...prev, skill])
    setSelectedSkills(prev => new Set([...prev, skill]))
    ensureSelectedJobVisible(filteredJobs)
  }

  const removeFilter = (chip: string) => {
    setSelectedJobTypes(prev => { const n = new Set(prev); n.delete(chip); return n })
    setSelectedSetups(prev => { const n = new Set(prev); n.delete(chip); return n })
    setSelectedLocations(prev => { const n = new Set(prev); n.delete(chip); return n })
    setSelectedSkills(prev => { const n = new Set(prev); n.delete(chip); return n })
    if (chip.startsWith('Match')) setMinMatchScore(0)
    ensureSelectedJobVisible(filteredJobs)
  }

  const clearAllFilters = () => {
    setSelectedJobTypes(new Set())
    setSelectedSetups(new Set())
    setSelectedLocations(new Set())
    setSelectedSkills(new Set())
    setSearchQuery('')
    setLocationSearch('')
    setMinMatchScore(0)
    setOnlyShowMatched(false)
    setShowSkillPicker(false)
    setSelectedJob(jobs[0] ?? null)
  }

  const toggleSave = async (jobId: string) => {
    const current = jobs.find(j => j.id === jobId)
    if (!current) return

    const nextIsSaved = !current.isSaved

    // Optimistic UI update
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isSaved: nextIsSaved } : j))
    if (selectedJob?.id === jobId)
      setSelectedJob(prev => prev ? { ...prev, isSaved: nextIsSaved } : null)

    const result = nextIsSaved
      ? await savedJobsService.saveJob(jobId)
      : await savedJobsService.unsaveJob(jobId)

    if (!result.isSuccess) {
      // Revert on failure
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isSaved: !nextIsSaved } : j))
      if (selectedJob?.id === jobId)
        setSelectedJob(prev => prev ? { ...prev, isSaved: !nextIsSaved } : null)
    }
  }

  const applyToJob = async (jobId: string) => {
    if (selectedJob?.hasApplied || applyingJobId) return

    setApplyingJobId(jobId)
    setApplyMessage('')
    setApplyError('')

    const result = await applicationService.apply({ jobListingId: jobId })

    if (result.isSuccess) {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, hasApplied: true, applicants: j.applicants + 1 } : j))
      if (selectedJob?.id === jobId) {
        setSelectedJob(prev => prev ? { ...prev, hasApplied: true, applicants: prev.applicants + 1 } : null)
      }
      setApplyMessage('Application submitted successfully.')
    } else {
      setApplyError(result.error || 'Failed to submit application.')
    }

    setApplyingJobId(null)
  }

  const toggleSkillPicker = () => {
    setShowSkillPicker(prev => !prev)
    if (showSkillPicker) setSkillPickerSearch('')
  }

  // ── Render ─────────────────────────────
  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="main-content">
        <PageHeader
          title="Browse Jobs"
          subtitle={`${filteredJobs.length} listings — updated today`}
          onMenuToggle={() => setIsSidebarOpen(v => !v)}
        >
          <div className="search-wrap">
            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search jobs, companies, skills..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="filters-toggle-btn"
            onClick={() => setIsFiltersOpen(v => !v)}
            aria-label="Toggle filters"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Filters
          </button>
          <button className="notif-btn">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="notif-indicator"></span>
          </button>
        </PageHeader>

        <div className="browse-body">

          {/* ══ LEFT — FILTER PANEL ══ */}
          <button
            type="button"
            className={`filter-overlay ${isFiltersOpen ? 'is-visible' : ''}`}
            onClick={() => setIsFiltersOpen(false)}
            aria-label="Close filters"
          />
          <aside className={`filter-panel ${isFiltersOpen ? 'is-open' : ''}`}>

            <div className="filter-header">
              <span className="filter-title">Filters</span>
              <button className="filter-clear" onClick={clearAllFilters}>Clear all</button>
            </div>

            {activeFilterChips.length > 0 && (
              <div className="active-filters">
                {activeFilterChips.map(chip => (
                  <span key={chip} className="active-chip" onClick={() => removeFilter(chip)}>
                    {chip}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </span>
                ))}
              </div>
            )}

            {/* Job Type */}
            <div className="filter-group">
              <p className="filter-group-label">Job Type</p>
              <div className="filter-options">
                {jobTypeOptions.map(opt => (
                  <label key={opt.label} className={`filter-check ${selectedJobTypes.has(opt.label) ? 'active-filter' : ''}`}>
                    <input type="checkbox" checked={selectedJobTypes.has(opt.label)} onChange={() => toggleJobType(opt.label)} />
                    <span className="checkmark"></span>
                    {opt.label}
                    <span className="filter-count">{opt.count}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-divider"></div>

            {/* Work Setup */}
            <div className="filter-group">
              <p className="filter-group-label">Work Setup</p>
              <div className="filter-options">
                {workSetupOptions.map(opt => (
                  <label key={opt.label} className={`filter-check ${selectedSetups.has(opt.label) ? 'active-filter' : ''}`}>
                    <input type="checkbox" checked={selectedSetups.has(opt.label)} onChange={() => toggleSetup(opt.label)} />
                    <span className="checkmark"></span>
                    {opt.label}
                    <span className="filter-count">{opt.count}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-divider"></div>

            {/* Location */}
            <div className="filter-group">
              <p className="filter-group-label">Location</p>
              <div className="filter-search-wrap">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  className="filter-search-input"
                  type="text"
                  placeholder="Search location..."
                  value={locationSearch}
                  onChange={e => setLocationSearch(e.target.value)}
                />
              </div>
              <div className="filter-options" style={{ marginTop: '10px' }}>
                {filteredLocationOptions.map(loc => (
                  <label key={loc.label} className={`filter-check ${selectedLocations.has(loc.label) ? 'active-filter' : ''}`}>
                    <input type="checkbox" checked={selectedLocations.has(loc.label)} onChange={() => toggleLocation(loc.label)} />
                    <span className="checkmark"></span>
                    {loc.label}
                    <span className="filter-count">{loc.count}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-divider"></div>

            {/* Skills / Tech Stack */}
            <div className="filter-group">
              <div className="filter-group-header-row">
                <p className="filter-group-label" style={{ margin: 0 }}>Skills / Tech Stack</p>
                <button className="add-skill-btn" onClick={toggleSkillPicker}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  Add
                </button>
              </div>

              <div className="skill-chips">
                {displayedSkills.map(skill => (
                  <button
                    key={skill}
                    className={`skill-chip ${selectedSkills.has(skill) ? 'selected' : ''}`}
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              {showSkillPicker && (
                <div className="skill-picker">
                  <div className="picker-search-wrap">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                      className="picker-search"
                      type="text"
                      placeholder="Search tech stack..."
                      value={skillPickerSearch}
                      onChange={e => setSkillPickerSearch(e.target.value)}
                      autoFocus
                    />
                    <button className="picker-close" onClick={toggleSkillPicker}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  <div className="picker-body">
                    {Object.entries(filteredSkillCategories).map(([cat, skills]) => (
                      <div key={cat} className="picker-category">
                        <p className="picker-cat-label">{cat}</p>
                        <div className="picker-chips">
                          {skills.map(s => (
                            <button
                              key={s}
                              className={`picker-chip ${displayedSkills.map(x => x.toLowerCase()).includes(s.toLowerCase()) ? 'picker-chip--added' : ''}`}
                              onClick={() => addSkillFromPicker(s)}
                            >
                              {displayedSkills.map(x => x.toLowerCase()).includes(s.toLowerCase()) && (
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                              )}
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {Object.keys(filteredSkillCategories).length === 0 && (
                      <p className="picker-empty">No results for "{skillPickerSearch}"</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="filter-divider"></div>

            {/* Match Score */}
            <div className="filter-group">
              <p className="filter-group-label">Min. Resume Match</p>
              <div className="match-range-wrap">
                <input
                  type="range"
                  className="match-range"
                  min={0} max={100} step={5}
                  value={minMatchScore}
                  onChange={e => setMinMatchScore(Number(e.target.value))}
                />
                <div className="match-range-labels">
                  <span>{minMatchScore}%+</span>
                  <span>100%</span>
                </div>
              </div>
              <label className="filter-check" style={{ marginTop: '8px' }}>
                <input type="checkbox" checked={onlyShowMatched} onChange={() => setOnlyShowMatched(prev => !prev)} />
                <span className="checkmark"></span>
                Only show matched jobs
              </label>
            </div>

          </aside>

          {/* ══ CENTER — JOB LIST ══ */}
          <section className="job-list-section">
            <div className="results-bar">
              <span className="results-count"><strong>{filteredJobs.length}</strong> jobs found</span>
              <div className="sort-wrap">
                <span className="sort-label">Sort by</span>
                <CustomDropdown
                  options={[
                    { value: 'recent', label: 'Most Recent' },
                    { value: 'match', label: 'Best Match' },
                    { value: 'company', label: 'Company A-Z' },
                  ]}
                  value={sortBy}
                  onChange={(val) => setSortBy(val as string)}
                  className="sort-select"
                />
              </div>
            </div>

            {isLoadingJobs ? (
              <BrowseJobsSkeleton />
            ) : loadError ? (
              <div className="empty-state">
                <p className="empty-title">Could not load jobs</p>
                <p className="empty-sub">{loadError}</p>
                <button className="filter-clear-btn" onClick={() => window.location.reload()}>Retry</button>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="#CBD5E1" strokeWidth="1.5" />
                  <path d="M21 21l-4.35-4.35" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p className="empty-title">No jobs found</p>
                <p className="empty-sub">Try adjusting your filters or search.</p>
                <button className="filter-clear-btn" onClick={clearAllFilters}>Clear all filters</button>
              </div>
            ) : (
              <>
                <div className="job-list">
                  {sortedFilteredJobs.map(job => (
                    <div
                      key={job.id}
                      className={`job-card ${selectedJob?.id === job.id ? 'job-card--selected' : ''}`}
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="job-card-top">
                        <div className="jc-meta">
                          <span className="jc-company">{job.company}</span>
                          <span className="jc-title">{job.title}</span>
                        </div>
                        <span className="jc-date">{job.postedDate}</span>
                      </div>
                      <div className="jc-tags">
                        <span className="jc-tag tag-type">{job.jobType}</span>
                        <span className="jc-tag tag-setup">{job.workSetup}</span>
                        <span className="jc-tag tag-location">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" />
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          {job.location}
                        </span>
                      </div>
                      <p className="jc-preview">{getPreviewText(job)}</p>
                      <div className="jc-footer">
                        <div className="jc-match">
                          <div className="jc-match-bar-bg">
                            <div className={`jc-match-bar ${getMatchCss(job.matchScore)}`} style={{ width: `${job.matchScore}%` }}></div>
                          </div>
                          <span className={`jc-match-pct ${getMatchCss(job.matchScore)}`}>{job.matchScore}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pagination">
                  <button
                    className="page-btn page-btn--prev"
                    disabled={!canGoPrev}
                    onClick={goPrev}
                    type="button"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>

                  {cursorStack.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`page-btn ${idx === pageIndex ? 'page-btn--active' : ''}`}
                      onClick={() => setPageIndex(idx)}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  {hasMore && <span className="page-ellipsis">...</span>}

                  <button
                    className="page-btn page-btn--next"
                    disabled={!canGoNext}
                    onClick={goNext}
                    type="button"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </section>

          {/* ══ RIGHT — JOB DETAIL PANEL ══ */}
          <aside className="job-detail-panel">
            {selectedJob === null ? (
              <div className="jd-empty">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="7" width="20" height="14" rx="2" stroke="#CBD5E1" strokeWidth="1.5" />
                  <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p className="jd-empty-title">Select a job</p>
                <p className="jd-empty-sub">Click any listing to view full details here.</p>
              </div>
            ) : (
              <>
                <div className="jd-header">
                  <div className="jd-header-meta">
                    <h2 className="jd-title">{selectedJob.title}</h2>
                    <a href={`/company/1`} className="jd-company-name">{selectedJob.company}</a>
                  </div>
                </div>

                <div className="jd-info-grid">
                  <div className="jd-info-item jd-info-item--match">
                    <span className="jd-info-label">Resume Match</span>
                    <div className="jd-match-inline">
                      <span className={`jd-match-score-inline ${getMatchColorClass(selectedJob.matchScore)}`}>
                        {selectedJob.matchScore}%
                      </span>
                      <div className="jd-match-ring-small">
                        {(() => {
                          const circ = 75.4
                          const off = circ - (circ * selectedJob.matchScore / 100)
                          return (
                            <svg width="28" height="28" viewBox="0 0 28 28">
                              <circle cx="14" cy="14" r="12" fill="none" stroke="#E2E8F0" strokeWidth="2.5" />
                              <circle cx="14" cy="14" r="12" fill="none"
                                stroke={getMatchRingColor(selectedJob.matchScore)}
                                strokeWidth="2.5"
                                strokeDasharray={circ.toFixed(1)}
                                strokeDashoffset={off.toFixed(1)}
                                strokeLinecap="round"
                                transform="rotate(-90 14 14)" />
                            </svg>
                          )
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="jd-info-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="jd-info-label">Setup</span>
                    <span className="jd-info-value">{selectedJob.workSetup}</span>
                  </div>

                  <div className="jd-info-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="jd-info-label">Type</span>
                    <span className="jd-info-value">{selectedJob.jobType}</span>
                  </div>

                  <div className="jd-info-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span className="jd-info-label">Location</span>
                    <span className="jd-info-value">{selectedJob.location}</span>
                  </div>

                  <div className="jd-info-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="jd-info-label">Posted</span>
                    <span className="jd-info-value">{selectedJob.postedDate}</span>
                  </div>

                  <div className="jd-info-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="jd-info-label">Applicants</span>
                    <span className="jd-info-value">{selectedJob.applicants} applied</span>
                  </div>

                  <div className="jd-info-item jd-info-item--full">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span className="jd-info-label">Salary</span>
                    <span className="jd-info-value">{selectedJob.salary}</span>
                  </div>
                </div>

                <div className="jd-section">
                  <p className="jd-section-label">Required Skills</p>
                  <div className="jd-skills">
                    {selectedJob.matchedSkills.map(s => <span key={s} className="jd-skill matched">{s}</span>)}
                    {selectedJob.missingSkills.map(s => <span key={s} className="jd-skill unmatched">{s}</span>)}
                  </div>
                  <div className="jd-skills-legend">
                    <span className="legend-dot matched-dot"></span>
                    <span className="legend-text">Matched</span>
                    <span className="legend-dot unmatched-dot" style={{ marginLeft: '12px' }}></span>
                    <span className="legend-text">Missing</span>
                  </div>
                </div>

                <div className="jd-divider"></div>

                <div className="jd-section">
                  <p className="jd-section-label">About this role</p>
                  {selectedJob.description.map((para, i) => <p key={i} className="jd-description">{para}</p>)}
                </div>

                <div className="jd-divider"></div>

                <div className="jd-section">
                  <p className="jd-section-label">Responsibilities</p>
                  <ul className="jd-list">
                    {normalizeBulletLines(selectedJob.responsibilities).map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>

                <div className="jd-divider"></div>

                <div className="jd-section">
                  <p className="jd-section-label">Requirements</p>
                  <ul className="jd-list">
                    {normalizeBulletLines(selectedJob.requirements).map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>

                <div className="jd-cta">
                  <button
                    className={`btn-apply ${selectedJob.hasApplied ? 'btn-apply--applied' : ''}`}
                    onClick={() => applyToJob(selectedJob.id)}
                    disabled={selectedJob.hasApplied || applyingJobId === selectedJob.id}
                  >
                    {applyingJobId === selectedJob.id ? (
                      <>
                        <svg className="apply-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <path d="M21 12a9 9 0 11-6.219-8.56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                        <span>Applying...</span>
                      </>
                    ) : selectedJob.hasApplied ? (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Applied!</span>
                      </>
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Apply Now</span>
                      </>
                    )}
                  </button>
                  {(applyMessage || applyError) && (
                    <div className={`apply-feedback ${applyError ? 'apply-feedback--error' : 'apply-feedback--success'}`}>
                      {applyError || applyMessage}
                    </div>
                  )}
                  <button
                    className={`btn-save-job ${selectedJob.isSaved ? 'btn-save-job--saved' : ''}`}
                    onClick={() => toggleSave(selectedJob.id)}
                  >
                    {selectedJob.isSaved ? (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                        </svg>
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Save Job</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </aside>

        </div>
      </main>
    </div>
  )
}
