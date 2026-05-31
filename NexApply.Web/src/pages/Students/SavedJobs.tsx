import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {Sidebar} from "../../components/Sidebar";
import {PageHeader} from "../../components/PageHeader";
import { CustomDropdown } from "../../components/ui/CustomDropdown";
import "./SavedJobs.css";
import { savedJobsService } from "../../services/savedJobsService";
import { applicationService } from "../../services/applicationService";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SavedJob {
  id: string; // savedJobId
  jobListingId: string;
  title: string;
  company: string;
  location: string;
  type: string;
  setup: string;
  salary: string;
  postedAt: string; // ISO string
  savedAt: string; // ISO string
  postedDate: string;
  savedDate: string;
  description: string;
  applied: boolean;
  skills: string[];
}

type FilterTab = "All" | "Full-time" | "Internship" | "Remote" | "Applied";
type SortOption = "recent" | "company" | "type";

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
    default:        return copy.sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt));
  }
}

function typeClass(type: string): string {
  return `sj-type-${type.toLowerCase().replace(/-/g, "").replace(/\s/g, "")}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export  function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      const result = await savedJobsService.getSavedJobs();
      if (result.isSuccess && result.value) {
        const items: SavedJob[] = result.value.map(j => ({
          id: j.savedJobId,
          jobListingId: j.jobListingId,
          title: j.title,
          company: j.company,
          location: j.location,
          type: j.jobType,
          setup: j.workSetup,
          salary: j.salary,
          postedAt: j.postedAt,
          savedAt: j.savedAt,
          postedDate: new Date(j.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          savedDate: new Date(j.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          description: j.description,
          applied: j.hasApplied,
          skills: j.skills ?? [],
        }));
        setSavedJobs(items);
      } else {
        setLoadError(result.error || 'Failed to load saved jobs');
        setSavedJobs([]);
      }

      setIsLoading(false);
    };

    load();
  }, []);

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

  async function unsaveJob(job: SavedJob) {
    const result = await savedJobsService.unsaveJob(job.jobListingId);
    if (result.isSuccess) {
      setSavedJobs((prev) => prev.filter((j) => j.id !== job.id));
      return;
    }
    setLoadError(result.error || 'Failed to remove saved job');
  }

  async function markApplied(job: SavedJob) {
    const result = await applicationService.apply({ jobListingId: job.jobListingId });
    if (result.isSuccess) {
      setSavedJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, applied: true } : j))
      );
      return;
    }
    setLoadError(result.error || 'Failed to apply to job');
  }

  function resetFilters() {
    setSearchQuery("");
    setActiveFilter("All");
  }

  // ── Render ──

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="main-content">
        <PageHeader
          title="Saved Jobs"
          subtitle={`${savedJobs.length} saved jobs`}
          onMenuToggle={() => setIsSidebarOpen((value) => !value)}
        >
          <Link to="/job-board" className="sj-browse-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Browse More Jobs
          </Link>
        </PageHeader>

        <div className="sj-body">

          {isLoading && (
            <div className="sj-empty">
              <p className="sj-empty-title">Loading saved jobs…</p>
              <p className="sj-empty-sub">Please wait.</p>
            </div>
          )}

          {!isLoading && loadError && (
            <div className="sj-empty">
              <p className="sj-empty-title">Failed to load saved jobs</p>
              <p className="sj-empty-sub">{loadError}</p>
              <button className="sj-empty-reset" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          )}

          {!isLoading && !loadError && (
          <>
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

              <CustomDropdown
                options={[
                  { value: 'recent', label: 'Most Recent' },
                  { value: 'company', label: 'Company A–Z' },
                  { value: 'type', label: 'Job Type' },
                ]}
                value={sortBy}
                onChange={(val) => handleSortChange({ target: { value: val } } as any)}
                className="sj-sort-select"
              />
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
                    <Link to={`/job-board`} className="sj-view-btn">
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
          </>
          )}

        </div>
      </main>
    </div>
  );
}
