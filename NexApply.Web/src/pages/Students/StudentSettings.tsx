import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { PageHeader } from '../../components/PageHeader';
import { studentSettingsService } from '../../services/studentSettingsService';
import '../Company/CompanySettings.css';

type StudentPreferenceState = {
  jobAlertsEnabled: boolean;
  messageNotificationsEnabled: boolean;
};

const STORAGE_KEY = 'nexapply.student.settings.v1';
const MESSAGE_DISMISS_MS = 3000;
const DEFAULT_STUDENT_PREFERENCES: StudentPreferenceState = {
  jobAlertsEnabled: true,
  messageNotificationsEnabled: true,
};

const readPreferences = (): StudentPreferenceState => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STUDENT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<StudentPreferenceState>;
    return {
      jobAlertsEnabled: parsed.jobAlertsEnabled ?? DEFAULT_STUDENT_PREFERENCES.jobAlertsEnabled,
      messageNotificationsEnabled:
        parsed.messageNotificationsEnabled ?? DEFAULT_STUDENT_PREFERENCES.messageNotificationsEnabled,
    };
  } catch {
    return DEFAULT_STUDENT_PREFERENCES;
  }
};

const writePreferences = (prefs: StudentPreferenceState) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
};

const useAutoDismiss = (message: string | null, clearMessage: () => void) => {
  useEffect(() => {
    if (!message) return;
    const timerId = window.setTimeout(clearMessage, MESSAGE_DISMISS_MS);
    return () => window.clearTimeout(timerId);
  }, [message, clearMessage]);
};

export default function StudentSettings() {
  const initialPrefs = useMemo(() => readPreferences(), []);
  const [jobAlertsEnabled, setJobAlertsEnabled] = useState(initialPrefs.jobAlertsEnabled);
  const [messageNotificationsEnabled, setMessageNotificationsEnabled] = useState(initialPrefs.messageNotificationsEnabled);
  const [prefsMessage, setPrefsMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [accountError, setAccountError] = useState<string | null>(null);

  const [testimonialText, setTestimonialText] = useState('');
  const [testimonialSaving, setTestimonialSaving] = useState(false);
  const [testimonialMessage, setTestimonialMessage] = useState<string | null>(null);
  const [testimonialError, setTestimonialError] = useState<string | null>(null);

  const loadAccount = async () => {
    setAccountError(null);

    const result = await studentSettingsService.getSettings();
    if (result.isSuccess && result.value) {
      setTestimonialText(result.value.feedback || '');
    } else {
      setAccountError(result.error || 'Failed to load settings.');
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadAccount);
  }, []);

  useAutoDismiss(prefsMessage, () => setPrefsMessage(null));
  useAutoDismiss(testimonialMessage, () => setTestimonialMessage(null));

  const autoSavePreferences = (prefs: StudentPreferenceState) => {
    writePreferences(prefs);
    setPrefsMessage('Preferences saved.');
  };

  const onSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestimonialSaving(true);
    setTestimonialError(null);
    setTestimonialMessage(null);

    const result = await studentSettingsService.updateTestimonial(testimonialText);

    if (result.isSuccess) {
      setTestimonialMessage('Testimonial saved successfully.');
    } else {
      setTestimonialError(result.error || 'Failed to save testimonial.');
    }

    setTestimonialSaving(false);
  };

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="main-content">
        <PageHeader
          title="Settings"
          subtitle="Manage your student preferences"
          onMenuToggle={() => setIsSidebarOpen((value) => !value)}
        />

        <div className="page-body cs-page">
          <div className="cs-grid">
            {/* Profile */}
            <section className="cs-card">
              <h3 className="cs-card-title">Profile</h3>
              <p className="cs-card-subtitle">Update your resume and student profile.</p>

              <div className="cs-action-list">
                <Link to="/student-profile" className="cs-action">
                  <div className="cs-action-main">
                    <span className="cs-action-title">Resume & Profile</span>
                    <span className="cs-action-desc">Education, skills, resume uploads.</span>
                  </div>
                  <span className="cs-action-cta">Open</span>
                </Link>

                <div className="cs-action cs-action--disabled" aria-disabled="true">
                  <div className="cs-action-main">
                    <span className="cs-action-title">Privacy</span>
                    <span className="cs-action-desc">Control what companies can see.</span>
                  </div>
                  <span className="cs-pill">Coming soon</span>
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section className="cs-card">
              <h3 className="cs-card-title">Notifications</h3>
              <p className="cs-card-subtitle">Choose what we notify you about.</p>

              <div className="cs-toggle-row">
                <div>
                  <div className="cs-toggle-title">Job alerts</div>
                  <div className="cs-toggle-desc">Get notified when new jobs match your profile.</div>
                </div>
                <label className="cs-switch">
                  <input
                    type="checkbox"
                    checked={jobAlertsEnabled}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setJobAlertsEnabled(newValue);
                      autoSavePreferences({ jobAlertsEnabled: newValue, messageNotificationsEnabled });
                    }}
                  />
                  <span className="cs-slider" />
                </label>
              </div>

              <div className="cs-toggle-row">
                <div>
                  <div className="cs-toggle-title">Messages</div>
                  <div className="cs-toggle-desc">Get notified when recruiters message you.</div>
                </div>
                <label className="cs-switch">
                  <input
                    type="checkbox"
                    checked={messageNotificationsEnabled}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setMessageNotificationsEnabled(newValue);
                      autoSavePreferences({ jobAlertsEnabled, messageNotificationsEnabled: newValue });
                    }}
                  />
                  <span className="cs-slider" />
                </label>
              </div>

              {prefsMessage && (
                <div className="cs-alert cs-alert--ok">
                  {prefsMessage}
                </div>
              )}
            </section>

            {/* Testimonial */}
            <section className="cs-card cs-card--wide">
              <h3 className="cs-card-title">Testimonial</h3>
              <p className="cs-card-subtitle">Share your experience with NexApply.</p>

              {accountError && (
                <div className="cs-alert cs-alert--error">{accountError}</div>
              )}

              <form className="cs-form" onSubmit={onSaveTestimonial}>
                <label className="cs-field">
                  <textarea
                    className="cs-input"
                    rows={4}
                    placeholder="Share how NexApply helped you land your dream job..."
                    value={testimonialText}
                    onChange={(e) => setTestimonialText(e.target.value)}
                    maxLength={200}
                  />
                  <span className="cs-field-hint">{testimonialText.length}/200 characters</span>
                </label>

                {(testimonialError || testimonialMessage) && (
                  <div className={`cs-alert ${testimonialError ? 'cs-alert--error' : 'cs-alert--ok'}`}>
                    {testimonialError || testimonialMessage}
                  </div>
                )}

                <div className="cs-actions">
                  <button className="cs-btn cs-btn--primary" type="submit" disabled={testimonialSaving || !testimonialText.trim()}>
                    {testimonialSaving ? 'Saving…' : 'Save Testimonial'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
