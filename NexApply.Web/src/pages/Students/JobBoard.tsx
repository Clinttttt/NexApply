import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Sidebar} from "../../components/Sidebar";
import {PageHeader} from "../../components/PageHeader";
import { CustomDropdown } from "../../components/ui/CustomDropdown";
import { JobBoardSkeleton } from "./JobBoardSkeleton";
import "./JobBoard.css";
import { jobListingService, type JobBoardJobDto } from "../../services/jobListingService";
import { savedJobsService } from "../../services/savedJobsService";
import { applicationService } from "../../services/applicationService";
import { cookieService } from "../../lib/cookieService";

// ── Data Model ──────────────────────────────────────────────────────────────
interface JobItem {
  id: string;
  company: string;
  role: string;
  type: string;
  setup: string;
  location: string;
  postedAt: string; // ISO string
  postedDate: string;
  salary: string;
  applicants: number;
  matchPct: number;
  logoColor: string;
  logoText: string;
  skills: string[];
  about: string;
  responsibilities: string[];
  requirements: string[];
}

const LOGO_COLORS = ["purple", "blue", "green", "amber", "cyan", "red"] as const;

const formatPostedDate = (postedAt: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(postedAt));

const buildLogoText = (company: string) => {
  const parts = company.split(" ").filter(Boolean).slice(0, 2);
  const text = parts.map(p => p[0].toUpperCase()).join("");
  return text || "NA";
};

const pickLogoColor = (company: string) => {
  const sum = [...company].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return LOGO_COLORS[Math.abs(sum) % LOGO_COLORS.length];
};

const mapJobBoardDto = (job: JobBoardJobDto): JobItem => ({
  id: job.id,
  company: job.company,
  role: job.role,
  type: job.type,
  setup: job.setup,
  location: job.location,
  postedAt: job.postedAt,
  postedDate: formatPostedDate(job.postedAt),
  salary: job.salary,
  applicants: job.applicants,
  matchPct: job.matchPercentage,
  logoColor: pickLogoColor(job.company),
  logoText: buildLogoText(job.company),
  skills: job.skills ?? [],
  about: job.about,
  responsibilities: job.responsibilities ?? [],
  requirements: job.requirements ?? [],
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function getPreviewText(text: string): string {
  const sentences = text.split(". ").filter(Boolean);
  if (sentences.length >= 2) return sentences[0] + ". " + sentences[1] + ".";
  return text.length > 120 ? text.substring(0, 120) + "..." : text;
}

function normalizeBulletText(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/,{2,}/g, ",")
    .replace(/^[\s,;:•·\-–—*]+/g, "")
    .replace(/[\s,;:]+$/g, "")
    .trim();
}

function normalizeBulletLines(lines: string[]): string[] {
  const result: string[] = [];

  for (const line of lines ?? []) {
    if (!line) continue;

    const parts = line
      .split(/\r?\n|[•·]/g)
      .map(normalizeBulletText)
      .filter(Boolean);

    result.push(...parts);
  }

  return result;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function JobBoard() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [setupFilter, setSetupFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("Recent");
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      const jobIdFromQuery = new URLSearchParams(window.location.search).get("jobId");

      const jobsResult = await jobListingService.getJobBoardJobs();
      if (jobsResult.isSuccess && jobsResult.value) {
        const loaded = jobsResult.value.map(mapJobBoardDto);
        setJobs(loaded);

        // If a jobId is provided, preselect it (used by recruiter "Share Listing").
        if (jobIdFromQuery) {
          const match = loaded.find(j => j.id === jobIdFromQuery) ?? null;
          setSelectedJob(match);
        } else {
          setSelectedJob(null); // keep the "Select a job" empty state until user clicks
        }
      } else {
        setJobs([]);
        setLoadError(jobsResult.error || "Failed to load job board");
      }

      // If a user is logged in as a Student, sync persisted saved jobs (ignore failures).
      if (cookieService.isAuthenticated()) {
        const saved = await savedJobsService.getSavedJobs();
        if (saved.isSuccess && saved.value) {
          setSavedJobIds(new Set(saved.value.map(s => s.jobListingId)));
        }

        // Also sync previously applied jobs so the UI can show "Applied" immediately.
        const applications = await applicationService.getMyApplications();
        if (applications.isSuccess && applications.value) {
          setAppliedJobIds(new Set(applications.value.map(a => a.jobListingId)));
        }
      }

      setIsLoading(false);
    };

    load();
  }, []);

  // ── Filtered / sorted list ──
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.role.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (typeFilter) result = result.filter((j) => j.type === typeFilter);
    if (setupFilter) result = result.filter((j) => j.setup === setupFilter);

    if (sortOrder === "Match") {
      result = [...result].sort((a, b) => b.matchPct - a.matchPct);
    } else {
      result = [...result].sort(
        (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      );
    }

    return result;
  }, [jobs, searchQuery, typeFilter, setupFilter, sortOrder]);

  // ── Handlers ──
  function clearFilters() {
    setSearchQuery("");
    setTypeFilter("");
    setSetupFilter("");
  }

  async function toggleSave(jobId: string) {
    const willSave = !savedJobIds.has(jobId);

    // Optimistic UI update
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (willSave) next.add(jobId);
      else next.delete(jobId);
      return next;
    });

    const result = willSave
      ? await savedJobsService.saveJob(jobId)
      : await savedJobsService.unsaveJob(jobId);

    if (!result.isSuccess) {
      // Revert on failure
      setSavedJobIds((prev) => {
        const next = new Set(prev);
        if (willSave) next.delete(jobId);
        else next.add(jobId);
        return next;
      });
    }
  }

  async function applyNow(jobId: string) {
    if (applyingJobId || appliedJobIds.has(jobId)) return;

    setApplyingJobId(jobId);
    const result = await applicationService.apply({ jobListingId: jobId });

    if (result.isSuccess) {
      setAppliedJobIds((prev) => new Set([...prev, jobId]));
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, applicants: j.applicants + 1 } : j))
      );
      if (selectedJob?.id === jobId) {
        setSelectedJob((prev) => (prev ? { ...prev, applicants: prev.applicants + 1 } : prev));
      }
    }

    setApplyingJobId(null);
  }

  const hasActiveFilters =
    searchQuery.trim() !== "" || typeFilter !== "" || setupFilter !== "";

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="main-content">
        <PageHeader
          title="Job Board"
          subtitle={
            isLoading
              ? "Loading jobs…"
              : loadError
                ? "Failed to load jobs"
                : `${filteredJobs.length} listings — updated today`
          }
          onMenuToggle={() => setIsSidebarOpen((value) => !value)}
        >
          <div className="header-actions">
            <a
              href="/browse-jobs"
              className="btn-browse-for-you"
              onClick={(e) => {
                e.preventDefault();
                navigate("/browse-jobs");
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Browse For You
            </a>
          </div>
        </PageHeader>

        <div className="job-board-body">

          {/* ── Left Panel ── */}
          <div className="job-panel-left">

            {/* ── Toolbar ── */}
            <div className="jb-toolbar">
              <div className="search-wrap">
                <svg
                  className="search-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search role, company, or skill…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="jb-filters">
                <CustomDropdown
                  options={[
                    { value: '', label: 'All Types' },
                    { value: 'Full-time', label: 'Full-time' },
                    { value: 'Internship', label: 'Internship' },
                    { value: 'Part-time', label: 'Part-time' },
                    { value: 'Contract', label: 'Contract' },
                    { value: 'Freelance', label: 'Freelance' },
                  ]}
                  value={typeFilter}
                  onChange={(val) => setTypeFilter(val as string)}
                  className="filter-select"
                />

                <CustomDropdown
                  options={[
                    { value: '', label: 'All Setups' },
                    { value: 'Remote', label: 'Remote' },
                    { value: 'On-site', label: 'On-site' },
                    { value: 'Hybrid', label: 'Hybrid' },
                  ]}
                  value={setupFilter}
                  onChange={(val) => setSetupFilter(val as string)}
                  className="filter-select"
                />

                <CustomDropdown
                  options={[
                    { value: 'Recent', label: 'Most Recent' },
                    { value: 'Match', label: 'Best Match' },
                  ]}
                  value={sortOrder}
                  onChange={(val) => setSortOrder(val as string)}
                  className="filter-select"
                />

                {hasActiveFilters && (
                  <button className="btn-clear-filters" onClick={clearFilters}>
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* ── Job List ── */}
            <div className="job-list">
              {isLoading ? (
                <JobBoardSkeleton />
              ) : loadError ? (
                <div className="empty-state">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <p className="empty-state__title">Failed to load jobs</p>
                  <p className="empty-state__sub">{loadError}</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="empty-state">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <p className="empty-state__title">No jobs found</p>
                  <p className="empty-state__sub">
                    Try adjusting your search or filters.
                  </p>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isActive = selectedJob?.id === job.id;
                  return (
                    <div
                      key={job.id}
                      className={`job-card${isActive ? " job-card--active" : ""}`}
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="job-card__top">
                        <div className="job-card__info">
                          <p className="job-card__company">{job.company}</p>
                          <h3 className="job-card__role">{job.role}</h3>
                        </div>
                        <span className="job-card__date">{job.postedDate}</span>
                      </div>

                      <div className="job-card__tags">
                        <span className="jb-tag jb-tag--type">{job.type}</span>
                        <span className="jb-tag jb-tag--setup">{job.setup}</span>
                        {appliedJobIds.has(job.id) && (
                          <span className="jb-tag jb-tag--applied">Applied</span>
                        )}
                        {job.matchPct > 0 && (
                          <span className="jb-tag jb-tag--match">{job.matchPct}% Match</span>
                        )}
                        <span className="jb-tag jb-tag--location">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {job.location}
                        </span>
                      </div>

                      <p className="job-card__preview">{getPreviewText(job.about)}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="job-panel-right">
            {selectedJob === null ? (
              <div className="detail-empty">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
                </svg>
                <p className="detail-empty__title">Select a job to view details</p>
                <p className="detail-empty__sub">
                  Click any listing from the left to see the full description.
                </p>
              </div>
            ) : (
              <>
                {/* ── Detail Header ── */}
                <div className="detail-header">
                  <div className="detail-header__left">
                    <div>
                      <p className="detail-company">{selectedJob.company}</p>
                      <h2 className="detail-role">{selectedJob.role}</h2>
                    </div>
                  </div>
                  <div className="detail-header__actions">
                    <button
                      className={`btn-save${savedJobIds.has(selectedJob.id) ? " btn-save--saved" : ""}`}
                      onClick={() => toggleSave(selectedJob.id)}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill={savedJobIds.has(selectedJob.id) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                      {savedJobIds.has(selectedJob.id) ? "Saved" : "Save"}
                    </button>
                    <button
                      className="btn-apply"
                      onClick={() => applyNow(selectedJob.id)}
                      disabled={applyingJobId === selectedJob.id || appliedJobIds.has(selectedJob.id)}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      </svg>
                      {appliedJobIds.has(selectedJob.id)
                        ? "Applied"
                        : applyingJobId === selectedJob.id
                          ? "Applying…"
                          : "Apply Now"}
                    </button>
                  </div>
                </div>

                {/* ── Meta Grid ── */}
                <div className="detail-meta">
                  <div className="detail-meta__item">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
                    </svg>
                    <div>
                      <span className="detail-meta__key">TYPE</span>
                      <span className="detail-meta__val">{selectedJob.type}</span>
                    </div>
                  </div>
                  <div className="detail-meta__item">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                      <span className="detail-meta__key">LOCATION</span>
                      <span className="detail-meta__val">{selectedJob.location}</span>
                    </div>
                  </div>
                  <div className="detail-meta__item">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <div>
                      <span className="detail-meta__key">POSTED</span>
                      <span className="detail-meta__val">{selectedJob.postedDate}</span>
                    </div>
                  </div>
                  <div className="detail-meta__item">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <div>
                      <span className="detail-meta__key">APPLICANTS</span>
                      <span className="detail-meta__val">
                        {selectedJob.applicants} applied
                      </span>
                    </div>
                  </div>
                  <div className="detail-meta__item">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <div>
                      <span className="detail-meta__key">SALARY</span>
                      <span className="detail-meta__val">{selectedJob.salary}</span>
                    </div>
                  </div>
                  <div className="detail-meta__item">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <div>
                      <span className="detail-meta__key">SETUP</span>
                      <span className="detail-meta__val">{selectedJob.setup}</span>
                    </div>
                  </div>
                </div>

                {/* ── Required Skills ── */}
                <div className="detail-section">
                  <h4 className="detail-section__title">Required Skills</h4>
                  <div className="detail-skills">
                    {selectedJob.skills.map((skill) => (
                      <span key={skill} className="skill-chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ── About ── */}
                <div className="detail-section">
                  <h4 className="detail-section__title">About this role</h4>
                  <p className="detail-body">{selectedJob.about}</p>
                </div>

                {/* ── Responsibilities ── */}
                <div className="detail-section">
                  <h4 className="detail-section__title">Responsibilities</h4>
                  <ul className="detail-list">
                    {normalizeBulletLines(selectedJob.responsibilities).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* ── Requirements ── */}
                <div className="detail-section">
                  <h4 className="detail-section__title">Requirements</h4>
                  <ul className="detail-list">
                    {normalizeBulletLines(selectedJob.requirements).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* ── Bottom CTA ── */}
                <div className="detail-cta">
                  <button
                    className="btn-apply btn-apply--full"
                    onClick={() => applyNow(selectedJob.id)}
                    disabled={applyingJobId === selectedJob.id || appliedJobIds.has(selectedJob.id)}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                    {appliedJobIds.has(selectedJob.id)
                      ? "Applied"
                      : applyingJobId === selectedJob.id
                        ? "Applying…"
                        : "Apply Now"}
                  </button>
                  <button
                    className={`btn-save${savedJobIds.has(selectedJob.id) ? " btn-save--saved" : ""} btn-save--full`}
                    onClick={() => toggleSave(selectedJob.id)}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill={savedJobIds.has(selectedJob.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    {savedJobIds.has(selectedJob.id) ? "Saved" : "Save Job"}
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
