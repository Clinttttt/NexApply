import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {Sidebar} from "../../components/Sidebar";
import {PageHeader} from "../../components/PageHeader";
import "./SavedJobs.css";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SavedJob {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  setup: string;
  salary: string;
  postedDate: string;
  savedDate: string;
  description: string;
  applied: boolean;
  skills: string[];
}

type FilterTab = "All" | "Full-time" | "Internship" | "Remote" | "Applied";
type SortOption = "recent" | "company" | "type";

// ─── Seed data (mirrors Blazor @code block) ───────────────────────────────────

const INITIAL_JOBS: SavedJob[] = [
  {
    id: 1,
    title: "Full-Stack Developer Intern",
    company: "CodeBridge Co.",
    location: "Makati City",
    type: "Internship",
    setup: "Hybrid",
    salary: "₱8,000 / mo",
    postedDate: "Apr 7",
    savedDate: "Apr 8",
    applied: false,
    skills: ["C#", ".NET", "Blazor", "PostgreSQL", "REST API", "Docker", "Azure"],
    description:
      "CodeBridge Co. is looking for a motivated Full-Stack Developer Intern to join our product team, working across backend APIs and Blazor frontends.",
  },
  {
    id: 2,
    title: "React Frontend Developer",
    company: "NovaByte Inc.",
    location: "Quezon City",
    type: "Internship",
    setup: "Remote",
    salary: "₱6,000 / mo",
    postedDate: "Apr 6",
    savedDate: "Apr 7",
    applied: true,
    skills: ["React", "TypeScript", "Tailwind CSS", "REST API", "Git"],
    description:
      "NovaByte Inc. is hiring a React Frontend Developer Intern to build modern, responsive UIs for their SaaS platform.",
  },
  {
    id: 3,
    title: ".NET Core Developer",
    company: "TechSpark PH",
    location: "Ortigas Center",
    type: "Full-time",
    setup: "On-site",
    salary: "₱45,000 / mo",
    postedDate: "Apr 5",
    savedDate: "Apr 6",
    applied: false,
    skills: ["C#", ".NET 8", "EF Core", "SQL Server", "Azure"],
    description:
      "TechSpark PH needs a .NET Core Developer to build and maintain scalable enterprise systems for financial services clients.",
  },
  {
    id: 4,
    title: "DevOps / Cloud Engineer",
    company: "Stackify Labs",
    location: "Remote",
    type: "Full-time",
    setup: "Remote",
    salary: "₱60,000 / mo",
    postedDate: "Apr 4",
    savedDate: "Apr 5",
    applied: false,
    skills: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux"],
    description:
      "Stackify Labs is hiring a DevOps engineer to own their cloud infrastructure, improve deployment pipelines, and reduce downtime across microservices.",
  },
  {
    id: 5,
    title: "UI/UX Designer (Tech Focus)",
    company: "PixelCraft Studio",
    location: "Cebu City",
    type: "Full-time",
    setup: "Remote",
    salary: "₱40,000 / mo",
    postedDate: "Apr 3",
    savedDate: "Apr 4",
    applied: false,
    skills: ["Figma", "Design Systems", "Prototyping", "User Research", "Accessibility"],
    description:
      "PixelCraft Studio is growing its design team. You'll own end-to-end product design for multiple SaaS clients, from wireframes to polished design systems.",
  },
];

const FILTER_TABS: FilterTab[] = ["All", "Full-time", "Internship", "Remote", "Applied"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTabCount(jobs: SavedJob[], tab: FilterTab): number {
  switch (tab) {
    case "Full-time":  return jobs.filter((j) => j.type === "Full-time").length;
    case "Internship": return jobs.filter((j) => j.type === "Internship").length;
    case "Remote":     return jobs.filter((j) => j.setup === "Remote").length;
    case "Applied":    return jobs.filter((j) => j.applied).length;
    default:           return jobs.length;
  }
}

function applySort(jobs: SavedJob[], sortBy: SortOption): SavedJob[] {
  const copy = [...jobs];
  switch (sortBy) {
    case "company": return copy.sort((a, b) => a.company.localeCompare(b.company));
    case "type":    return copy.sort((a, b) => a.type.localeCompare(b.type));
    default:        return copy.sort((a, b) => b.savedDate.localeCompare(a.savedDate));
  }
}

function typeClass(type: string): string {
  return `sj-type-${type.toLowerCase().replace(/-/g, "").replace(/\s/g, "")}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export  function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(INITIAL_JOBS);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  // Mirrors ApplyFilters() + SortJobs() from @code
  const filteredJobs = useMemo<SavedJob[]>(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = savedJobs.filter((j) => {
      const matchSearch =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q));

      const matchFilter =
        activeFilter === "Full-time"  ? j.type === "Full-time"  :
        activeFilter === "Internship" ? j.type === "Internship" :
        activeFilter === "Remote"     ? j.setup === "Remote"    :
        activeFilter === "Applied"    ? j.applied               :
        true;

      return matchSearch && matchFilter;
    });

    return applySort(filtered, sortBy);
  }, [savedJobs, searchQuery, activeFilter, sortBy]);

  // ── Handlers ──

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSortBy(e.target.value as SortOption);
  }

  function unsaveJob(job: SavedJob) {
    setSavedJobs((prev) => prev.filter((j) => j.id !== job.id));
  }

  function markApplied(job: SavedJob) {
    setSavedJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, applied: true } : j))
    );
  }

  function resetFilters() {
    setSearchQuery("");
    setActiveFilter("All");
  }

  // ── Render ──

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <PageHeader title="Saved Jobs" subtitle={`${savedJobs.length} saved jobs`}>
          <Link to="/job-board" className="sj-browse-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Browse More Jobs
          </Link>
        </PageHeader>

        <div className="sj-body">

          {/* ── Filter + Sort Toolbar ── */}
          <div className="sj-toolbar">
            <div className="sj-filter-tabs">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  className={`sj-filter-tab${activeFilter === tab ? " active" : ""}`}
                  onClick={() => setActiveFilter(tab)}
                >
                  {tab}
                  <span className="sj-tab-count">{getTabCount(savedJobs, tab)}</span>
                </button>
              ))}
            </div>

            <div className="sj-toolbar-right">
              <div className="sj-search-mini">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="sj-search-input"
                  type="text"
                  placeholder="Search saved jobs..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

              <select
                className="sj-sort-select"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="recent">Most Recent</option>
                <option value="company">Company A–Z</option>
                <option value="type">Job Type</option>
              </select>
            </div>
          </div>

          {/* ── Job List / Empty State ── */}
          {filteredJobs.length === 0 ? (
            <div className="sj-empty">
              <div className="sj-empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
              </div>

              {searchQuery || activeFilter !== "All" ? (
                <>
                  <p className="sj-empty-title">No results found</p>
                  <p className="sj-empty-sub">Try adjusting your search or filters.</p>
                  <button className="sj-empty-reset" onClick={resetFilters}>
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <p className="sj-empty-title">No saved jobs yet</p>
                  <p className="sj-empty-sub">
                    Browse listings and hit the bookmark icon to save jobs you're interested in.
                  </p>
                  <Link to="/job-board" className="sj-empty-cta">
                    Browse Job Board
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="sj-list">
              {filteredJobs.map((job) => (
                <div key={job.id} className={`sj-card${job.applied ? " applied" : ""}`}>

                  {/* Top Row */}
                  <div className="sj-card-top">
                    <div className="sj-card-main">
                      <div className="sj-card-company-row">
                        <span className="sj-card-company">{job.company}</span>
                        <span className="sj-card-date">Saved {job.savedDate}</span>
                      </div>
                      <div className="sj-card-title">{job.title}</div>
                      <div className="sj-card-meta">
                        <span className={`sj-type-badge ${typeClass(job.type)}`}>{job.type}</span>
                        <span className="sj-setup-pill">{job.setup}</span>
                        <span className="sj-loc-row">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {job.location}
                        </span>
                        {job.salary && (
                          <span className="sj-salary-row">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="1" x2="12" y2="23" />
                              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                            </svg>
                            {job.salary}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="sj-card-actions">
                      {job.applied ? (
                        <span className="sj-applied-badge">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Applied
                        </span>
                      ) : (
                        <button className="sj-apply-btn" onClick={() => markApplied(job)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                          Apply Now
                        </button>
                      )}

                      <button
                        className="sj-unsave-btn"
                        onClick={() => unsaveJob(job)}
                        title="Remove from saved"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="sj-card-desc">{job.description}</p>

                  {/* Card Footer */}
                  <div className="sj-card-footer">
                    <Link to={`/job-board/${job.id}`} className="sj-view-btn">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      View
                    </Link>
                    <div className="sj-card-skills">
                      {job.skills.slice(0, 6).map((skill) => (
                        <span key={skill} className="sj-skill">{skill}</span>
                      ))}
                      {job.skills.length > 6 && (
                        <span className="sj-skill muted">+{job.skills.length - 6} more</span>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
