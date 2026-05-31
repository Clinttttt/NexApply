import { useEffect, useMemo, useState } from 'react'
import './ApplicantResumeModal.css'
import { companyApplicantsService } from '../../services/companyApplicantsService'
import type { ResumeContentDto } from '../../services/studentProfileService'

type TabKey = 'uploaded' | 'profile'

interface ApplicantResumeModalProps {
  isVisible: boolean
  applicationId: string
  applicantName: string
  applicantEmail: string
  onClose: () => void
  initialTab?: TabKey
}

function fileTypeFromName(fileName?: string, contentType?: string) {
  const mime = (contentType || '').toLowerCase()
  if (mime.includes('pdf')) return 'pdf'
  if (mime.startsWith('image/')) return 'image'
  if (mime.includes('wordprocessingml')) return 'docx'

  const ext = (fileName || '').substring((fileName || '').lastIndexOf('.')).toLowerCase()
  if (ext === '.pdf') return 'pdf'
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') return 'image'
  if (ext === '.docx') return 'docx'
  return 'unknown'
}

export function ApplicantResumeModal({
  isVisible,
  applicationId,
  applicantName,
  applicantEmail,
  onClose,
  initialTab = 'uploaded'
}: ApplicantResumeModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)

  const [uploadedLoading, setUploadedLoading] = useState(false)
  const [uploadedError, setUploadedError] = useState<string | null>(null)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [uploadedContentType, setUploadedContentType] = useState<string | null>(null)

  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileResume, setProfileResume] = useState<ResumeContentDto | null>(null)

  const uploadedFileType = useMemo(
    () => fileTypeFromName(uploadedFileName || undefined, uploadedContentType || undefined),
    [uploadedFileName, uploadedContentType]
  )

  useEffect(() => {
    if (!isVisible) return
    const timer = window.setTimeout(() => setActiveTab(initialTab), 0)
    return () => window.clearTimeout(timer)
  }, [isVisible, initialTab])

  // Load uploaded resume
  useEffect(() => {
    if (!isVisible) return
    if (!applicationId) return

    let isCancelled = false

    const loadUploaded = async () => {
      setUploadedLoading(true)
      setUploadedError(null)

      // Reset previous blob URL
      setUploadedFileName(null)
      setUploadedContentType(null)
      setUploadedFileUrl(prev => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })

      const result = await companyApplicantsService.getApplicantUploadedResumeFile(applicationId)
      if (isCancelled) return

      if (!result.isSuccess || !result.value) {
        setUploadedError(result.error || 'No uploaded resume found.')
        setUploadedLoading(false)
        return
      }

      const { blob, fileName, contentType } = result.value
      setUploadedFileName(fileName || 'resume')
      setUploadedContentType(contentType || blob.type || null)
      setUploadedFileUrl(URL.createObjectURL(blob))
      setUploadedLoading(false)
    }

    void loadUploaded()

    return () => {
      isCancelled = true
    }
  }, [isVisible, applicationId])

  // Cleanup blob url when modal closes / unmounts
  useEffect(() => {
    if (isVisible) return
    const timer = window.setTimeout(() => {
      setUploadedFileUrl(prev => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [isVisible])

  // Load profile/templated resume
  useEffect(() => {
    if (!isVisible) return
    if (!applicationId) return

    let isCancelled = false

    const loadContent = async () => {
      setProfileLoading(true)
      setProfileError(null)
      setProfileResume(null)

      const result = await companyApplicantsService.getApplicantResumeContent(applicationId)
      if (isCancelled) return

      if (!result.isSuccess || !result.value) {
        setProfileError(result.error || 'Failed to load profile resume.')
        setProfileLoading(false)
        return
      }

      setProfileResume(result.value)
      setProfileLoading(false)
    }

    void loadContent()

    return () => {
      isCancelled = true
    }
  }, [isVisible, applicationId])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isVisible) return null

  return (
    <div className="arm-backdrop" onClick={handleBackdropClick}>
      <div className="arm-modal" role="dialog" aria-modal="true" aria-labelledby="arm-title">
        <div className="arm-header">
          <div className="arm-header-text">
            <h2 className="arm-title" id="arm-title">{applicantName}&apos;s Resume</h2>
            <p className="arm-subtitle">{applicantEmail}</p>
          </div>
          <button className="arm-close" onClick={onClose} aria-label="Close modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="arm-tabs" role="tablist" aria-label="Resume tabs">
          <button
            className={`arm-tab ${activeTab === 'uploaded' ? 'active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'uploaded'}
            onClick={() => setActiveTab('uploaded')}
            type="button"
          >
            Uploaded Resume
          </button>
          <button
            className={`arm-tab ${activeTab === 'profile' ? 'active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
            type="button"
          >
            Profile Resume
          </button>
        </div>

        <div className="arm-body">
          {activeTab === 'uploaded' ? (
            <div className="arm-panel">
              {uploadedLoading ? (
                <div className="arm-state">
                  <span className="arm-spinner" aria-hidden="true"></span>
                  Loading uploaded resume…
                </div>
              ) : uploadedError ? (
                <div className="arm-state arm-state--muted">{uploadedError}</div>
              ) : uploadedFileUrl ? (
                <>
                  <div className="arm-filemeta">
                    <span className="arm-filename">{uploadedFileName}</span>
                    <a className="arm-link" href={uploadedFileUrl} target="_blank" rel="noreferrer">Open in new tab</a>
                  </div>

                  {uploadedFileType === 'pdf' ? (
                    <iframe className="arm-iframe" src={uploadedFileUrl} title="Uploaded resume PDF" />
                  ) : uploadedFileType === 'image' ? (
                    <img className="arm-image" src={uploadedFileUrl} alt="Uploaded resume" />
                  ) : (
                    <div className="arm-state arm-state--muted">
                      We can’t preview this file type here. Please download it.
                    </div>
                  )}
                </>
              ) : (
                <div className="arm-state arm-state--muted">No uploaded resume found.</div>
              )}
            </div>
          ) : (
            <div className="arm-panel">
              {profileLoading ? (
                <div className="arm-state">
                  <span className="arm-spinner" aria-hidden="true"></span>
                  Loading profile resume…
                </div>
              ) : profileError ? (
                <div className="arm-state arm-state--muted">{profileError}</div>
              ) : profileResume ? (
                <div className="arm-profile">
                  {(profileResume.headline || profileResume.location) && (
                    <div className="arm-section">
                      <div className="arm-section-title">Summary</div>
                      {profileResume.headline && <div className="arm-text"><strong>{profileResume.headline}</strong></div>}
                      {profileResume.location && <div className="arm-text">{profileResume.location}</div>}
                    </div>
                  )}

                  {profileResume.aboutMe && (
                    <div className="arm-section">
                      <div className="arm-section-title">About</div>
                      <div className="arm-text">{profileResume.aboutMe}</div>
                    </div>
                  )}

                  <div className="arm-section">
                    <div className="arm-section-title">Education</div>
                    {profileResume.education.length === 0 ? (
                      <div className="arm-muted">No education added.</div>
                    ) : (
                      <ul className="arm-list">
                        {profileResume.education.map(e => (
                          <li key={e.id || `${e.institution}-${e.degree}`} className="arm-list-item">
                            <div className="arm-item-title">{e.institution}</div>
                            <div className="arm-item-sub">{e.degree}{e.field ? ` • ${e.field}` : ''}</div>
                            {(e.startYear || e.endYear) && (
                              <div className="arm-item-meta">{e.startYear || '—'} – {e.endYear || '—'}</div>
                            )}
                            {e.description && <div className="arm-text">{e.description}</div>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="arm-section">
                    <div className="arm-section-title">Work Experience</div>
                    {profileResume.workExperience.length === 0 ? (
                      <div className="arm-muted">No work experience added.</div>
                    ) : (
                      <ul className="arm-list">
                        {profileResume.workExperience.map(w => (
                          <li key={w.id || `${w.company}-${w.position}`} className="arm-list-item">
                            <div className="arm-item-title">{w.company}</div>
                            <div className="arm-item-sub">{w.position}{w.location ? ` • ${w.location}` : ''}</div>
                            {(w.startDate || w.endDate || w.isCurrent) && (
                              <div className="arm-item-meta">
                                {w.startDate ? new Date(w.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                                {' – '}
                                {w.isCurrent ? 'Present' : (w.endDate ? new Date(w.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—')}
                              </div>
                            )}
                            {w.description && <div className="arm-text">{w.description}</div>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="arm-section">
                    <div className="arm-section-title">Skills</div>
                    {profileResume.skills.length === 0 ? (
                      <div className="arm-muted">No skills added.</div>
                    ) : (
                      <div className="arm-chips">
                        {profileResume.skills.map(s => <span key={s} className="arm-chip">{s}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="arm-state arm-state--muted">No resume content available.</div>
              )}
            </div>
          )}
        </div>

        <div className="arm-footer">
          <button className="arm-btn arm-btn--secondary" onClick={onClose}>Close</button>
          {uploadedFileUrl && (
            <a
              className="arm-btn arm-btn--primary"
              href={uploadedFileUrl}
              download={uploadedFileName || 'resume'}
            >
              Download
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
