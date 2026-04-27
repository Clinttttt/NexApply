import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {Sidebar} from "../../components/Sidebar";
import {PageHeader} from "../../components/PageHeader";
import "./JobBoard.css";

// ── Data Model ──────────────────────────────────────────────────────────────
interface JobItem {
  id: number;
  company: string;
  role: string;
  type: string;
  setup: string;
  location: string;
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

// ── Static Data ──────────────────────────────────────────────────────────────
const ALL_JOBS: JobItem[] = [
  {
    id: 1,
    company: "CodeBridge Co.",
    role: "Full-Stack Developer Intern",
    type: "Internship",
    setup: "Hybrid",
    location: "Makati City",
    postedDate: "Apr 7",
    salary: "₱8,000 / mo",
    applicants: 14,
    matchPct: 91,
    logoColor: "purple",
    logoText: "CB",
    skills: ["C#", ".NET Core", "Blazor", "PostgreSQL", "REST API", "Docker", "Azure"],
    about:
      "CodeBridge Co. is looking for a motivated Full-Stack Developer Intern to join our product team. You will work alongside senior engineers building scalable web applications using Blazor Server and .NET Core Web API with PostgreSQL as the primary database. This is a hands-on internship — you will participate in sprint planning, code reviews, and daily standups.",
    responsibilities: [
      "Build and maintain Blazor Server components and pages",
      "Design and consume RESTful API endpoints with .NET Core",
      "Write and optimize PostgreSQL queries using Dapper",
      "Participate in code reviews and agile sprints",
      "Collaborate with UI/UX on frontend implementation",
    ],
    requirements: [
      "Strong foundation in C# and object-oriented programming",
      "Basic understanding of SQL and relational databases",
      "Familiarity with Git version control",
      "Currently enrolled in a CS, IT, or related degree program",
      "Able to commit to at least 4 months",
    ],
  },
  {
    id: 2,
    company: "ApexCore Solutions",
    role: "API Developer (.NET)",
    type: "Full-time",
    setup: "Hybrid",
    location: "Makati City",
    postedDate: "Apr 2",
    salary: "₱35,000 – ₱50,000 / mo",
    applicants: 27,
    matchPct: 62,
    logoColor: "blue",
    logoText: "AP",
    skills: ["C#", ".NET 8", "Web API", "Entity Framework", "SQL Server", "Redis", "Docker"],
    about:
      "ApexCore Solutions is hiring a mid-level API Developer to build and maintain enterprise-grade REST APIs powering fintech products used across Southeast Asia. You will own the design and delivery of microservices in a cloud-first environment.",
    responsibilities: [
      "Design, build, and maintain scalable .NET Web API services",
      "Integrate with third-party payment and banking APIs",
      "Implement caching strategies using Redis",
      "Write unit and integration tests with xUnit",
      "Collaborate with frontend and mobile teams on API contracts",
    ],
    requirements: [
      "2+ years experience with .NET Web API development",
      "Strong knowledge of SQL Server and Entity Framework Core",
      "Experience with Docker and containerized deployments",
      "Understanding of OAuth2 / JWT authentication",
      "Excellent written and verbal communication skills",
    ],
  },
  {
    id: 3,
    company: "NovaByte Inc.",
    role: "React Frontend Developer",
    type: "Internship",
    setup: "Remote",
    location: "Quezon City",
    postedDate: "Apr 3",
    salary: "₱6,500 / mo",
    applicants: 41,
    matchPct: 65,
    logoColor: "green",
    logoText: "NV",
    skills: ["React", "TypeScript", "Tailwind CSS", "REST API", "Git", "Figma"],
    about:
      "NovaByte Inc. is seeking a React Frontend Developer Intern to help ship polished, accessible UI components for our SaaS dashboard products. You will work directly with the product designer and backend team in a fully remote setup.",
    responsibilities: [
      "Build reusable React components following design specs",
      "Integrate REST APIs using Axios or React Query",
      "Write clean, maintainable TypeScript code",
      "Implement responsive layouts with Tailwind CSS",
      "Participate in weekly design and engineering syncs",
    ],
    requirements: [
      "Solid understanding of React hooks and component lifecycle",
      "Proficiency in TypeScript",
      "Experience consuming REST APIs",
      "Familiarity with version control using Git",
      "Portfolio or GitHub showcasing personal or academic projects",
    ],
  },
  {
    id: 4,
    company: "TechSpark PH",
    role: ".NET Core Developer",
    type: "Full-time",
    setup: "On-site",
    location: "Ortigas Center",
    postedDate: "Apr 4",
    salary: "₱40,000 – ₱55,000 / mo",
    applicants: 19,
    matchPct: 71,
    logoColor: "amber",
    logoText: "TS",
    skills: ["C#", ".NET Core", "MVC", "EF Core", "SQL Server", "Azure DevOps"],
    about:
      "TechSpark PH is a growing software firm specializing in government and enterprise solutions. We are hiring a .NET Core Developer to join our backend team delivering robust, secure web applications for public sector clients.",
    responsibilities: [
      "Develop and maintain ASP.NET Core MVC applications",
      "Design database schemas and write efficient EF Core queries",
      "Implement authentication and role-based access control",
      "Collaborate with project managers and business analysts",
      "Deploy applications through Azure DevOps pipelines",
    ],
    requirements: [
      "1–3 years experience in .NET Core development",
      "Strong understanding of MVC architecture",
      "Experience with SQL Server and stored procedures",
      "Ability to read and interpret technical requirements",
      "Willing to work on-site in Ortigas",
    ],
  },
  {
    id: 5,
    company: "SkyLink Digital",
    role: "DevOps Engineer",
    type: "Full-time",
    setup: "Remote",
    location: "Remote — PH",
    postedDate: "Apr 5",
    salary: "₱55,000 – ₱75,000 / mo",
    applicants: 33,
    matchPct: 48,
    logoColor: "cyan",
    logoText: "SK",
    skills: ["Docker", "Kubernetes", "CI/CD", "Terraform", "AWS", "Linux", "Bash"],
    about:
      "SkyLink Digital is looking for an experienced DevOps Engineer to automate, scale, and secure our cloud infrastructure on AWS. You will work across engineering teams to streamline delivery pipelines and maintain production reliability at scale.",
    responsibilities: [
      "Build and maintain CI/CD pipelines using GitHub Actions",
      "Manage containerized workloads with Kubernetes (EKS)",
      "Write infrastructure-as-code using Terraform",
      "Monitor system health with CloudWatch and Grafana",
      "Lead incident response and post-mortem reviews",
    ],
    requirements: [
      "3+ years in a DevOps or SRE role",
      "Hands-on experience with AWS services (EC2, RDS, S3, EKS)",
      "Strong proficiency with Docker and Kubernetes",
      "Experience writing Terraform or Pulumi modules",
      "Comfortable with Linux systems administration and Bash scripting",
    ],
  },
  {
    id: 6,
    company: "DataForge PH",
    role: "Data Engineer",
    type: "Contract",
    setup: "Hybrid",
    location: "BGC, Taguig",
    postedDate: "Apr 6",
    salary: "₱60,000 / mo",
    applicants: 11,
    matchPct: 55,
    logoColor: "red",
    logoText: "DF",
    skills: ["Python", "SQL", "Apache Spark", "Airflow", "GCP", "BigQuery", "dbt"],
    about:
      "DataForge PH is a data consultancy building modern data stacks for retail and logistics clients. We are looking for a contract Data Engineer to design and maintain ETL pipelines and data warehouse models for a 6-month engagement.",
    responsibilities: [
      "Design and build ETL pipelines with Apache Airflow",
      "Model data transformations using dbt on BigQuery",
      "Collaborate with data analysts on schema design",
      "Monitor pipeline health and resolve data quality issues",
      "Document data lineage and transformation logic",
    ],
    requirements: [
      "Strong Python skills for data pipeline development",
      "Experience with BigQuery or another cloud data warehouse",
      "Familiarity with dbt for data transformation",
      "Understanding of dimensional modeling (star schema)",
      "Available to start within 2 weeks",
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function getPreviewText(text: string): string {
  const sentences = text.split(". ").filter(Boolean);
  if (sentences.length >= 2) return sentences[0] + ". " + sentences[1] + ".";
  return text.length > 120 ? text.substring(0, 120) + "..." : text;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function JobBoard() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [setupFilter, setSetupFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("Recent");
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());

  // ── Filtered / sorted list ──
  const filteredJobs = useMemo(() => {
    let result = [...ALL_JOBS];

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
    }

    return result;
  }, [searchQuery, typeFilter, setupFilter, sortOrder]);

  // ── Handlers ──
  function clearFilters() {
    setSearchQuery("");
    setTypeFilter("");
    setSetupFilter("");
  }

  function toggleSave(jobId: number) {
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
      return next;
    });
  }

  const hasActiveFilters =
    searchQuery.trim() !== "" || typeFilter !== "" || setupFilter !== "";

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <PageHeader
          title="Job Board"
          subtitle={`${filteredJobs.length} listings — updated today`}
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
                <select
                  className="filter-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>

                <select
                  className="filter-select"
                  value={setupFilter}
                  onChange={(e) => setSetupFilter(e.target.value)}
                >
                  <option value="">All Setups</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>

                <select
                  className="filter-select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="Recent">Most Recent</option>
                  <option value="Match">Best Match</option>
                </select>

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
              {filteredJobs.length === 0 ? (
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
                    <button className="btn-apply">
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
                      Apply Now
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
                    {selectedJob.responsibilities.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* ── Requirements ── */}
                <div className="detail-section">
                  <h4 className="detail-section__title">Requirements</h4>
                  <ul className="detail-list">
                    {selectedJob.requirements.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* ── Bottom CTA ── */}
                <div className="detail-cta">
                  <button className="btn-apply btn-apply--full">
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
                    Apply Now
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
