import { useState, useMemo } from 'react'
import './BrowseJobs.css'
import {Sidebar} from '../../components/Sidebar'
import {PageHeader} from '../../components/PageHeader'

// ─────────────────────────────────────────
//  INTERFACES
// ─────────────────────────────────────────

interface JobListing {
  id: number
  title: string
  company: string
  jobType: string
  workSetup: string
  location: string
  matchScore: number
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

const ALL_JOBS: JobListing[] = [
  {
    id: 1, title: 'Full-Stack Developer Intern', company: 'CodeBridge Co.',
    jobType: 'Internship', workSetup: 'Remote', location: 'Makati City',
    matchScore: 91, postedDate: 'Apr 7', applicants: 14, salary: '₱8,000 / mo',
    logoText: 'CB', logoCss: 'logo-cb', isSaved: true, hasApplied: false,
    matchedSkills: ['C#', '.NET Core', 'Blazor', 'PostgreSQL', 'REST API'],
    missingSkills: ['Docker', 'Azure'],
    description: [
      'CodeBridge Co. is looking for a motivated Full-Stack Developer Intern to join our product team. You will work alongside senior engineers building scalable web applications using Blazor Server and .NET Core Web API with PostgreSQL as the primary database.',
      'This is a hands-on internship — you will participate in sprint planning, code reviews, and daily standups. A strong foundation in C# and basic SQL is required.'
    ],
    responsibilities: [
      'Build and maintain Blazor Server components and pages',
      'Design and consume RESTful API endpoints with .NET Core',
      'Write and optimize PostgreSQL queries using Dapper',
      'Participate in code reviews and agile sprints',
      'Collaborate with UI/UX on frontend implementation'
    ],
    requirements: [
      'Strong foundation in C# and object-oriented programming',
      'Basic understanding of SQL and relational databases',
      'Familiarity with Git version control',
      'Currently enrolled in a CS, IT, or related degree program',
      'Able to commit to at least 4 months'
    ]
  },
  {
    id: 2, title: 'C# Backend Intern', company: 'SkyNet Systems',
    jobType: 'Internship', workSetup: 'Hybrid', location: 'BGC, Taguig',
    matchScore: 84, postedDate: 'Apr 6', applicants: 9, salary: '₱10,000 / mo',
    logoText: 'SN', logoCss: 'logo-sn', isSaved: false, hasApplied: false,
    matchedSkills: ['.NET', 'SQL Server', 'C#', 'REST API'],
    missingSkills: ['Redis', 'RabbitMQ'],
    description: [
      'SkyNet Systems is hiring a C# Backend Intern to support our platform engineering team.',
      'Hybrid role in BGC, Taguig. Clean C# code and relational database experience required.'
    ],
    responsibilities: [
      'Develop and maintain backend services in C# and .NET',
      'Write SQL queries and stored procedures for SQL Server',
      'Help design and document RESTful API contracts',
      'Debug issues and support production deployments',
      'Write unit and integration tests for new features'
    ],
    requirements: [
      '1-2 years experience with C# and .NET',
      'Strong SQL Server knowledge',
      'Understanding of REST API principles',
      'Good communication skills',
      'Willing to work hybrid in BGC, Taguig'
    ]
  },
  {
    id: 3, title: 'Junior Software Engineer', company: 'Luminary Labs',
    jobType: 'Full-time', workSetup: 'Remote', location: 'Anywhere',
    matchScore: 77, postedDate: 'Apr 5', applicants: 22, salary: '₱35,000 / mo',
    logoText: 'LL', logoCss: 'logo-ll', isSaved: false, hasApplied: false,
    matchedSkills: ['Blazor', 'PostgreSQL', 'Git'],
    missingSkills: ['Kubernetes', 'Terraform', 'Go'],
    description: [
      'Luminary Labs is a fully remote product company. You will own features end-to-end.',
      'We value clean code, strong communication, and a growth mindset.'
    ],
    responsibilities: [
      'Own features from design through deployment',
      'Participate in sprint planning and retrospectives',
      'Write clean, tested, and documented code',
      'Review pull requests from peers',
      'Monitor and troubleshoot production systems'
    ],
    requirements: [
      '2+ years of software development experience',
      'Proficiency in Blazor or similar frontend framework',
      'Experience with PostgreSQL or similar database',
      'Strong problem-solving skills',
      'Excellent written and verbal communication'
    ]
  },
  {
    id: 4, title: '.NET Core Developer', company: 'TechSpark PH',
    jobType: 'Full-time', workSetup: 'On-site', location: 'Ortigas Center',
    matchScore: 71, postedDate: 'Apr 4', applicants: 17, salary: '₱40,000 - ₱55,000 / mo',
    logoText: 'TS', logoCss: 'logo-ts', isSaved: false, hasApplied: false,
    matchedSkills: ['.NET Core', 'C#', 'EF Core'],
    missingSkills: ['Angular', 'Docker', 'Azure DevOps'],
    description: [
      'TechSpark PH needs a .NET Core Developer for enterprise web applications in finance and logistics.',
      'Strong .NET ecosystem knowledge required.'
    ],
    responsibilities: [
      'Develop web applications using ASP.NET Core and EF Core',
      'Collaborate with business analysts',
      'Conduct code reviews and ensure quality',
      'Maintain and extend existing .NET applications',
      'Document technical designs'
    ],
    requirements: [
      '1-3 years experience in .NET Core development',
      'Strong understanding of MVC architecture',
      'Experience with SQL Server and stored procedures',
      'Ability to read and interpret technical requirements',
      'Willing to work on-site in Ortigas'
    ]
  },
  {
    id: 5, title: 'React Frontend Developer', company: 'NovaByte Inc.',
    jobType: 'Internship', workSetup: 'Remote', location: 'Quezon City',
    matchScore: 65, postedDate: 'Apr 3', applicants: 31, salary: '₱6,500 / mo',
    logoText: 'NV', logoCss: 'logo-nv', isSaved: false, hasApplied: false,
    matchedSkills: ['JavaScript', 'HTML/CSS'],
    missingSkills: ['React', 'TypeScript', 'Tailwind', 'GraphQL'],
    description: [
      'NovaByte Inc. is hiring a React Frontend Developer Intern to build modern, responsive UIs.',
      'Passion for UI/UX and vanilla JS required.'
    ],
    responsibilities: [
      'Build React components using TypeScript',
      'Implement pixel-perfect Figma designs',
      'Integrate frontend with REST and GraphQL APIs',
      'Optimize for performance and accessibility',
      'Write unit tests using Jest'
    ],
    requirements: [
      'Solid understanding of React hooks and component lifecycle',
      'Proficiency in TypeScript',
      'Experience consuming REST APIs',
      'Familiarity with version control using Git',
      'Portfolio or GitHub showcasing personal or academic projects'
    ]
  },
  {
    id: 6, title: 'API Developer (.NET)', company: 'ApexCore Solutions',
    jobType: 'Full-time', workSetup: 'Hybrid', location: 'Makati City',
    matchScore: 62, postedDate: 'Apr 2', applicants: 11, salary: '₱35,000 - ₱50,000 / mo',
    logoText: 'AP', logoCss: 'logo-ap', isSaved: false, hasApplied: false,
    matchedSkills: ['.NET', 'REST API', 'SQL'],
    missingSkills: ['gRPC', 'Kafka', 'OpenAPI'],
    description: [
      'ApexCore Solutions needs an API Developer for our internal and external API ecosystem.',
      'Strong .NET Web API knowledge required. Hybrid — 2 days on-site in Makati City.'
    ],
    responsibilities: [
      'Design and build RESTful APIs using .NET',
      'Maintain Swagger/OpenAPI documentation',
      'Implement versioning, rate limiting, and security',
      'Collaborate with frontend teams',
      'Optimize API performance'
    ],
    requirements: [
      '2+ years experience with .NET Web API development',
      'Strong knowledge of SQL Server and Entity Framework Core',
      'Experience with Docker and containerized deployments',
      'Understanding of OAuth2 / JWT authentication',
      'Excellent written and verbal communication skills'
    ]
  }
]

const JOB_TYPE_OPTIONS: FilterOption[] = [
  { label: 'Full-time', count: 3 }, { label: 'Internship', count: 3 },
  { label: 'Part-time', count: 0 }, { label: 'Contract', count: 0 }, { label: 'Freelance', count: 0 }
]

const WORK_SETUP_OPTIONS: FilterOption[] = [
  { label: 'Remote', count: 3 }, { label: 'On-site', count: 1 }, { label: 'Hybrid', count: 2 }
]

const LOCATION_OPTIONS: FilterOption[] = [
  { label: 'Makati City', count: 2 }, { label: 'BGC, Taguig', count: 1 },
  { label: 'Ortigas Center', count: 1 }, { label: 'Quezon City', count: 1 }, { label: 'Anywhere', count: 1 }
]

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

// ─────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────

export function BrowseJobs() {

  // ── State ──────────────────────────────
  const [jobs, setJobs] = useState<JobListing[]>(ALL_JOBS)
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(ALL_JOBS[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [locationSearch, setLocationSearch] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [minMatchScore, setMinMatchScore] = useState(0)
  const [onlyShowMatched, setOnlyShowMatched] = useState(false)
  const [showSkillPicker, setShowSkillPicker] = useState(false)
  const [skillPickerSearch, setSkillPickerSearch] = useState('')
  const [selectedJobTypes, setSelectedJobTypes] = useState<Set<string>>(new Set())
  const [selectedSetups, setSelectedSetups] = useState<Set<string>>(new Set())
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set())
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set())
  const [displayedSkills, setDisplayedSkills] = useState<string[]>([
    'C#', '.NET', 'Blazor', 'React', 'PostgreSQL', 'Python', 'TypeScript', 'Vue.js', 'Docker', 'Azure'
  ])

  // ── Computed ───────────────────────────
  const filteredLocationOptions = useMemo(() =>
    locationSearch.trim() === ''
      ? LOCATION_OPTIONS
      : LOCATION_OPTIONS.filter(l => l.label.toLowerCase().includes(locationSearch.toLowerCase())),
    [locationSearch]
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
    return list.sort((a, b) => b.id - a.id)
  }, [filteredJobs, sortBy])

  // ── Handlers ───────────────────────────
  const ensureSelectedJobVisible = (filtered: JobListing[]) => {
    if (selectedJob && !filtered.some(j => j.id === selectedJob.id))
      setSelectedJob(filtered[0] ?? null)
  }

  const toggleSet = (set: Set<string>, val: string): Set<string> => {
    const next = new Set(set)
    next.has(val) ? next.delete(val) : next.add(val)
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
    setSelectedJob(ALL_JOBS[0])
  }

  const toggleSave = (jobId: number) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isSaved: !j.isSaved } : j))
    if (selectedJob?.id === jobId)
      setSelectedJob(prev => prev ? { ...prev, isSaved: !prev.isSaved } : null)
  }

  const toggleApply = (jobId: number) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, hasApplied: !j.hasApplied } : j))
    if (selectedJob?.id === jobId)
      setSelectedJob(prev => prev ? { ...prev, hasApplied: !prev.hasApplied } : null)
  }

  const toggleSkillPicker = () => {
    setShowSkillPicker(prev => !prev)
    if (showSkillPicker) setSkillPickerSearch('')
  }

  // ── Render ─────────────────────────────
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <PageHeader title="Browse Jobs" subtitle={`${filteredJobs.length} listings — updated today`}>
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
          <aside className="filter-panel">

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
                {JOB_TYPE_OPTIONS.map(opt => (
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
                {WORK_SETUP_OPTIONS.map(opt => (
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
                <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="recent">Most Recent</option>
                  <option value="match">Best Match</option>
                  <option value="company">Company A-Z</option>
                </select>
              </div>
            </div>

            {filteredJobs.length === 0 ? (
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
                  <button className="page-btn page-btn--prev" disabled>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button className="page-btn page-btn--active">1</button>
                  <button className="page-btn">2</button>
                  <button className="page-btn">3</button>
                  <span className="page-ellipsis">...</span>
                  <button className="page-btn">8</button>
                  <button className="page-btn page-btn--next">
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
                    {selectedJob.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>

                <div className="jd-divider"></div>

                <div className="jd-section">
                  <p className="jd-section-label">Requirements</p>
                  <ul className="jd-list">
                    {selectedJob.requirements.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>

                <div className="jd-cta">
                  <button
                    className={`btn-apply ${selectedJob.hasApplied ? 'btn-apply--applied' : ''}`}
                    onClick={() => toggleApply(selectedJob.id)}
                  >
                    {selectedJob.hasApplied ? (
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
