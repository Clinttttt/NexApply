import React, { useState, useEffect } from 'react';
import './ScheduleInterviewModal.css';
import { jobListingService } from '../../services/jobListingService';

interface InterviewData {
  candidateName: string;
  jobTitle: string;
  scheduledAt: string;
  durationMins: number;
  format: string;
  location: string;
  notes: string;
}

interface ScheduleResult {
  interview: InterviewData;
  interviewTime: string;
  interviewerName: string;
}

interface ScheduleInterviewModalProps {
  isVisible: boolean;
  isRescheduleMode?: boolean;
  interview?: InterviewData;
  interviewTime?: string;
  interviewerName?: string;
  onClose: () => void;
  onConfirm: (result: ScheduleResult) => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isVisible,
  isRescheduleMode = false,
  interview: initialInterview,
  interviewTime: initialTime,
  interviewerName: initialInterviewerName,
  onClose,
  onConfirm,
}) => {
  const [interview, setInterview] = useState<InterviewData>(
    initialInterview || {
      candidateName: '',
      jobTitle: '',
      scheduledAt: new Date().toISOString().split('T')[0],
      durationMins: 60,
      format: '',
      location: '',
      notes: '',
    }
  );

  const [interviewTime, setInterviewTime] = useState(initialTime || '10:00');
  const [interviewerName, setInterviewerName] = useState(initialInterviewerName || '');
  const [jobListings, setJobListings] = useState<Array<{ id: string; title: string }>>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    setInterview(initialInterview || {
      candidateName: '',
      jobTitle: '',
      scheduledAt: new Date().toISOString().split('T')[0],
      durationMins: 60,
      format: '',
      location: '',
      notes: '',
    });
    setInterviewTime(initialTime || '10:00');
    setInterviewerName(initialInterviewerName || '');
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && !isRescheduleMode) {
      fetchJobListings();
    }
  }, [isVisible, isRescheduleMode]);

  const fetchJobListings = async () => {
    setIsLoadingJobs(true);
    const result = await jobListingService.getCompanyJobListings();
    if (result.isSuccess && result.value) {
      setJobListings(result.value.map(j => ({ id: j.id, title: j.title })));
    }
    setIsLoadingJobs(false);
  };

  const handleConfirm = () => {
    if (!interview.candidateName || !interview.jobTitle || !interview.format) return;

    onConfirm({
      interview,
      interviewTime,
      interviewerName,
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="sched-backdrop" onClick={handleBackdropClick}>
      <div className="sched-modal" role="dialog" aria-modal="true" aria-labelledby="sched-modal-title">
        {/* Header */}
        <div className="sched-header">
          <div className="sched-header-icon">
            {isRescheduleMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.3" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            )}
          </div>
          <div className="sched-header-text">
            <h2 className="sched-title" id="sched-modal-title">
              {isRescheduleMode ? 'Reschedule Interview' : 'Schedule Interview'}
            </h2>
            <p className="sched-subtitle">
              {isRescheduleMode ? 'Update interview date, time, or details' : 'Set up a new candidate interview'}
            </p>
          </div>
          <button className="sched-close" onClick={onClose} aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="sched-body">
          {/* Section: Candidate & Position */}
          <div className="sched-section">
            <span className="sched-section-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Candidate & Position
            </span>
            <div className="sched-field">
              <label className="sched-label" htmlFor="sched-candidate">
                Candidate Name <span className="sched-required">*</span>
              </label>
              <input
                id="sched-candidate"
                className="sched-input"
                type="text"
                placeholder="e.g. Kira Reyes"
                value={interview.candidateName}
                onChange={(e) => setInterview({ ...interview, candidateName: e.target.value })}
              />
            </div>
            <div className="sched-field">
              <label className="sched-label" htmlFor="sched-position">
                Position <span className="sched-required">*</span>
              </label>
              <select
                id="sched-position"
                className="sched-select"
                value={interview.jobTitle}
                onChange={(e) => setInterview({ ...interview, jobTitle: e.target.value })}
                disabled={isLoadingJobs}
              >
                <option value="">Select position…</option>
                {jobListings.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sched-divider"></div>

          {/* Section: Date, Time & Duration */}
          <div className="sched-section">
            <span className="sched-section-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Date & Time
            </span>
            <div className="sched-field-row">
              <div className="sched-field">
                <label className="sched-label" htmlFor="sched-date">
                  Date <span className="sched-required">*</span>
                </label>
                <input
                  id="sched-date"
                  className="sched-input"
                  type="date"
                  value={interview.scheduledAt}
                  onChange={(e) => setInterview({ ...interview, scheduledAt: e.target.value })}
                />
              </div>
              <div className="sched-field">
                <label className="sched-label" htmlFor="sched-time">
                  Time <span className="sched-required">*</span>
                </label>
                <input
                  id="sched-time"
                  className="sched-input"
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                />
              </div>
              <div className="sched-field">
                <label className="sched-label" htmlFor="sched-duration">Duration</label>
                <select
                  id="sched-duration"
                  className="sched-select"
                  value={interview.durationMins}
                  onChange={(e) => setInterview({ ...interview, durationMins: Number(e.target.value) })}
                >
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                </select>
              </div>
            </div>
          </div>

          <div className="sched-divider"></div>

          {/* Section: Format & Location */}
          <div className="sched-section">
            <span className="sched-section-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Format & Location
            </span>
            <div className="sched-field">
              <label className="sched-label">
                Interview Format <span className="sched-required">*</span>
              </label>
              <div className="sched-format-toggle">
                {['Video Call', 'On-site', 'Phone'].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    className={`sched-fmt-btn ${interview.format === fmt ? 'active' : ''}`}
                    onClick={() => setInterview({ ...interview, format: fmt })}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
            <div className="sched-field">
              <label className="sched-label" htmlFor="sched-location">
                Location / Meeting Link
                <span className="sched-label-hint">
                  {interview.format === 'Video Call' ? '— paste your Zoom or Meet URL' :
                   interview.format === 'On-site' ? '— include room or floor' : ''}
                </span>
              </label>
              <input
                id="sched-location"
                className="sched-input"
                type="text"
                placeholder={
                  interview.format === 'Video Call' ? 'https://zoom.us/j/...' :
                  interview.format === 'On-site' ? 'e.g. HQ Conference Room A' :
                  'e.g. +63 2 1234 5678'
                }
                value={interview.location}
                onChange={(e) => setInterview({ ...interview, location: e.target.value })}
              />
            </div>
          </div>

          <div className="sched-divider"></div>

          {/* Section: Panel Notes */}
          <div className="sched-section">
            <span className="sched-section-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Interview Panel
              <span className="sched-label-optional">Optional</span>
            </span>
            <div className="sched-field">
              <label className="sched-label" htmlFor="sched-panel">Interviewer Name</label>
              <input
                id="sched-panel"
                className="sched-input"
                type="text"
                placeholder="e.g. Anna Vidal"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
              />
            </div>
            <div className="sched-field">
              <label className="sched-label" htmlFor="sched-notes">Notes for Interviewers</label>
              <textarea
                id="sched-notes"
                className="sched-textarea"
                rows={3}
                placeholder="Topics to cover, questions to ask, context about the candidate..."
                value={interview.notes}
                onChange={(e) => setInterview({ ...interview, notes: e.target.value })}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sched-footer">
          <p className="sched-footer-hint">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Fields marked <span>*</span> are required.
          </p>
          <div className="sched-footer-actions">
            <button className="sched-btn-cancel" type="button" onClick={onClose}>Cancel</button>
            <button className="sched-btn-confirm" type="button" onClick={handleConfirm}>
              {isRescheduleMode ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 .49-3.3" />
                  </svg>
                  <span>Update Interview</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Schedule Interview</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
