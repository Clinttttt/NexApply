import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './CompanyApplicantProfile.css'
import { CompanySidebar } from '../../components/CompanySidebar'
import { CompanyHeader } from '../../components/CompanyHeader'
import { ApplicantResumeModal } from '../../components/modal/ApplicantResumeModal'
import { companyApplicantsService, type ApplicantDto } from '../../services/companyApplicantsService'

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('')
}

function formatAppliedAt(dt: string) {
  const d = new Date(dt)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function normalizeLink(urlOrHandle?: string) {
  if (!urlOrHandle) return ''
  const v = urlOrHandle.trim()
  if (!v) return ''
  if (v.startsWith('http://') || v.startsWith('https://')) return v
  return `https://${v}`
}

export default function CompanyApplicantProfile() {
  const { applicationId } = useParams()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applicant, setApplicant] = useState<ApplicantDto | null>(null)
  const [showResumeModal, setShowResumeModal] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!applicationId) {
        setError('Missing application id')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      const result = await companyApplicantsService.getApplicant(applicationId)
      if (result.isSuccess && result.value) setApplicant(result.value)
      else setError(result.error || 'Failed to load applicant')

      setIsLoading(false)
    }

    void load()
  }, [applicationId])

  const links = useMemo(() => {
    if (!applicant) return []
    const out: { label: string; href: string; display: string }[] = []

    if (applicant.portfolio) {
      const href = normalizeLink(applicant.portfolio)
      out.push({ label: 'Portfolio', href, display: href.replace(/^https?:\/\//, '') })
    }
    if (applicant.linkedIn) {
      const href = applicant.linkedIn.includes('linkedin.com')
        ? normalizeLink(applicant.linkedIn)
        : `https://linkedin.com/in/${applicant.linkedIn}`
      out.push({ label: 'LinkedIn', href, display: href.replace(/^https?:\/\//, '') })
    }
    if (applicant.gitHub) {
      const href = applicant.gitHub.includes('github.com')
        ? normalizeLink(applicant.gitHub)
        : `https://github.com/${applicant.gitHub}`
      out.push({ label: 'GitHub', href, display: href.replace(/^https?:\/\//, '') })
    }

    return out
  }, [applicant])

  return (
    <div className="app-shell">
      <CompanySidebar />

      <div className="main-content">
        <CompanyHeader title="Applicant Profile" subtitle="Review candidate info for this application" />

        <div className="cap-page">
          <div className="cap-topbar">
            <Link to="/company-applicants" className="cap-back">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Applicants
            </Link>
          </div>

          {isLoading ? (
            <div className="cap-state cap-state--loading">
              <svg className="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Loading profile…
            </div>
          ) : error ? (
            <div className="cap-state cap-state--error">
              <div className="cap-state-title">Couldn’t load applicant</div>
              <div className="cap-state-sub">{error}</div>
            </div>
          ) : !applicant ? (
            <div className="cap-state cap-state--empty">
              <div className="cap-state-title">Applicant not found</div>
              <div className="cap-state-sub">This application may have been removed or you don’t have access.</div>
            </div>
          ) : (
            <div className="cap-grid">
              {/* LEFT: identity */}
              <section className="cap-panel cap-panel--identity">
                <div className="cap-identity">
                  <div className="cap-avatar">{initials(applicant.studentName)}</div>
                  <div className="cap-identity-meta">
                    <div className="cap-name">{applicant.studentName}</div>
                    <div className="cap-kicker">
                      Applied for <span className="cap-kicker-strong">{applicant.jobTitle}</span>
                    </div>
                  </div>
                </div>

                <div className="cap-divider" />

                <div className="cap-info">
                  <div className="cap-info-row">
                    <span className="cap-info-label">Email</span>
                    <a className="cap-info-link" href={`mailto:${applicant.email}`}>{applicant.email}</a>
                  </div>
                  <div className="cap-info-row">
                    <span className="cap-info-label">Phone</span>
                    <span className="cap-info-value">{applicant.phone || '—'}</span>
                  </div>
                  <div className="cap-info-row">
                    <span className="cap-info-label">Location</span>
                    <span className="cap-info-value">{applicant.location || '—'}</span>
                  </div>
                </div>

                {links.length > 0 && (
                  <>
                    <div className="cap-divider" />
                    <div className="cap-links">
                      <div className="cap-section-title">Links</div>
                      {links.map(l => (
                        <a key={l.label} className="cap-link" href={l.href} target="_blank" rel="noreferrer">
                          <span className="cap-link-label">{l.label}</span>
                          <span className="cap-link-url">{l.display}</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M14 3h7v7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M21 14v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </>
                )}

                <div className="cap-divider" />

                <div className="cap-skills">
                  <div className="cap-section-title">Skills</div>
                  <div className="cap-skill-chips">
                    {(applicant.skills || []).length > 0 ? (
                      applicant.skills.map(s => <span key={s} className="cap-skill">{s}</span>)
                    ) : (
                      <span className="cap-muted">No skills captured.</span>
                    )}
                  </div>
                </div>
              </section>

              {/* RIGHT: application context */}
              <section className="cap-panel cap-panel--context">
                <div className="cap-context-top">
                  <div>
                    <div className="cap-section-title">Application</div>
                    <div className="cap-subtle">Application ID: {applicant.applicationId}</div>
                  </div>
                  <div className="cap-badges">
                    <span className={`cap-status cap-status--${(applicant.status || '').toLowerCase()}`}>
                      {applicant.status}
                    </span>
                    {typeof applicant.matchScore === 'number' && (
                      <span className="cap-match">
                        Match <strong>{applicant.matchScore}%</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="cap-context-grid">
                  <div className="cap-kv">
                    <span className="cap-k">Role</span>
                    <span className="cap-v">{applicant.jobTitle}</span>
                  </div>
                  <div className="cap-kv">
                    <span className="cap-k">Type</span>
                    <span className="cap-v">{applicant.jobType}</span>
                  </div>
                  <div className="cap-kv">
                    <span className="cap-k">Applied</span>
                    <span className="cap-v">{formatAppliedAt(applicant.appliedAt)}</span>
                  </div>
                </div>

                <div className="cap-action-row">
                  <button type="button" className="cap-primary-btn" onClick={() => setShowResumeModal(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Resume
                  </button>
                </div>

                <div className="cap-divider" />

                <div className="cap-block">
                  <div className="cap-section-title">Cover Letter</div>
                  {applicant.coverLetter ? (
                    <div className="cap-prose">{applicant.coverLetter}</div>
                  ) : (
                    <div className="cap-muted">No cover letter provided.</div>
                  )}
                </div>

                <div className="cap-divider" />

                <div className="cap-block">
                  <div className="cap-section-title">Recruiter Notes</div>
                  {applicant.recruiterNotes ? (
                    <div className="cap-prose">{applicant.recruiterNotes}</div>
                  ) : (
                    <div className="cap-muted">No notes yet. Add notes from the Applicants page.</div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {applicant && applicationId && (
        <ApplicantResumeModal
          isVisible={showResumeModal}
          applicationId={applicationId}
          applicantName={applicant.studentName}
          applicantEmail={applicant.email}
          onClose={() => setShowResumeModal(false)}
        />
      )}
    </div>
  )
}
