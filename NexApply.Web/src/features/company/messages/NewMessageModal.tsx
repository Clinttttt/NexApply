import React, { useMemo, useState } from 'react'
import './NewMessageModal.css'

export interface NewMessagePerson {
  userId: string
  name: string
  role: string
  jobTitle?: string
}

interface NewMessageModalProps {
  isVisible: boolean
  people: NewMessagePerson[]
  onClose: () => void
  onSelect: (userId: string) => void
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('')
}

function avatarColor(seed: string) {
  const n = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return ['blue', 'green', 'amber', 'slate', 'purple'][n % 5]
}

export function NewMessageModal({ isVisible, people, onClose, onSelect }: NewMessageModalProps) {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return people
    return people.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.jobTitle ?? '').toLowerCase().includes(query) ||
      (p.role ?? '').toLowerCase().includes(query)
    )
  }, [people, q])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isVisible) return null

  return (
    <div className="nm-backdrop" onClick={handleBackdropClick}>
      <div className="nm-modal" role="dialog" aria-modal="true" aria-labelledby="nm-title">
        <div className="nm-header">
          <div className="nm-header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div className="nm-header-text">
            <h2 className="nm-title" id="nm-title">New Message</h2>
            <p className="nm-subtitle">Pick a recipient to open the chat.</p>
          </div>
          <button className="nm-close" type="button" onClick={onClose} aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="nm-body">
          <div className="nm-search-wrap" role="search">
            <span className="nm-search-icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <input
              className="nm-search-input"
              type="search"
              placeholder="Search candidates, companies…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          </div>

          <div className="nm-list">
            {filtered.length === 0 ? (
              <div className="nm-empty">
                <p className="nm-empty-title">No matches</p>
                <p className="nm-empty-sub">Try a different name or job title.</p>
              </div>
            ) : (
              filtered.map(p => (
                <button
                  key={p.userId}
                  type="button"
                  className="nm-item"
                  onClick={() => onSelect(p.userId)}
                >
                  <div className={`nm-avatar nm-avatar--${avatarColor(p.userId)}`}>{initials(p.name)}</div>
                  <div className="nm-item-meta">
                    <div className="nm-item-top">
                      <span className="nm-name">{p.name}</span>
                      <span className="nm-role">{p.role}</span>
                    </div>
                    {p.jobTitle && <div className="nm-job">{p.jobTitle}</div>}
                  </div>
                  <svg className="nm-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
