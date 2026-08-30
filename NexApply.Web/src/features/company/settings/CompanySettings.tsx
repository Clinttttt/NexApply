import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CompanySidebar } from '@/shared/components/CompanySidebar';
import { CompanyHeader } from '@/shared/components/CompanyHeader';
import { companySettingsService } from '@/shared/api/companySettingsService';
import './CompanySettings.css';

const MESSAGE_DISMISS_MS = 3000;

const useAutoDismiss = (message: string | null, clearMessage: () => void) => {
  useEffect(() => {
    if (!message) return;
    const timerId = window.setTimeout(clearMessage, MESSAGE_DISMISS_MS);
    return () => window.clearTimeout(timerId);
  }, [message, clearMessage]);
};

export default function CompanySettings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [settingsLoading, setSettingsLoading] = useState(true);

  const [emailUpdatesEnabled, setEmailUpdatesEnabled] = useState(false);
  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [testimonialText, setTestimonialText] = useState('');
  const [testimonialSaving, setTestimonialSaving] = useState(false);
  const [testimonialMessage, setTestimonialMessage] = useState<string | null>(null);
  const [testimonialError, setTestimonialError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setSettingsLoading(true);
      setSettingsError(null);

      const result = await companySettingsService.getSettings();
      if (result.isSuccess && result.value) {
        setEmailUpdatesEnabled(result.value.applicantUpdatesEnabled);
        setWeeklyDigestEnabled(result.value.weeklyDigestEnabled);
        setTestimonialText(result.value.testimonial || '');
      } else {
        setSettingsError(result.error || 'Failed to load settings.');
      }

      setSettingsLoading(false);
    };

    load();
  }, []);

  useAutoDismiss(settingsMessage, () => setSettingsMessage(null));
  useAutoDismiss(testimonialMessage, () => setTestimonialMessage(null));

  const autoSaveNotificationSettings = async (applicantUpdatesEnabled: boolean, weeklyDigestEnabled: boolean) => {
    setSettingsError(null);
    setSettingsMessage(null);

    const result = await companySettingsService.updateSettings({
      applicantUpdatesEnabled,
      weeklyDigestEnabled,
    });

    if (result.isSuccess && result.value) {
      setEmailUpdatesEnabled(result.value.applicantUpdatesEnabled);
      setWeeklyDigestEnabled(result.value.weeklyDigestEnabled);
      setSettingsMessage('Notification preferences saved.');
    } else {
      setSettingsError(result.error || 'Failed to save settings.');
    }
  };

  const onSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestimonialSaving(true);
    setTestimonialError(null);
    setTestimonialMessage(null);

    const result = await companySettingsService.updateTestimonial(testimonialText);

    if (result.isSuccess) {
      setTestimonialMessage('Testimonial saved successfully.');
    } else {
      setTestimonialError(result.error || 'Failed to save testimonial.');
    }

    setTestimonialSaving(false);
  };

  return (
    <div className="app-shell">
      <CompanySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="main-content">
        <CompanyHeader
          title="Settings"
          subtitle="Manage your recruiter workspace preferences"
          onMenuToggle={() => setIsSidebarOpen((value) => !value)}
        />

        <div className="page-body cs-page">
          <div className="cs-grid">

            <section className="cs-card">
              <h3 className="cs-card-title">Company</h3>
              <p className="cs-card-subtitle">Update your public profile and recruiting defaults.</p>

              <div className="cs-action-list">
                <Link to="/company-profile" className="cs-action">
                  <div className="cs-action-main">
                    <span className="cs-action-title">Company Profile</span>
                    <span className="cs-action-desc">Brand, hiring manager, socials, perks.</span>
                  </div>
                  <span className="cs-action-cta">Open</span>
                </Link>

                <div className="cs-action cs-action--disabled" aria-disabled="true">
                  <div className="cs-action-main">
                    <span className="cs-action-title">Job posting defaults</span>
                    <span className="cs-action-desc">Default work setup, salary visibility, templates.</span>
                  </div>
                  <span className="cs-pill">Coming soon</span>
                </div>

                <div className="cs-action cs-action--disabled" aria-disabled="true">
                  <div className="cs-action-main">
                    <span className="cs-action-title">Team members</span>
                    <span className="cs-action-desc">Invite recruiters, set roles and permissions.</span>
                  </div>
                  <span className="cs-pill">Coming soon</span>
                </div>
              </div>
            </section>

            <section className="cs-card">
              <h3 className="cs-card-title">Notifications</h3>
              <p className="cs-card-subtitle">Control what gets emailed to your team.</p>

              <div className="cs-toggle-row">
                <div>
                  <div className="cs-toggle-title">Applicant updates</div>
                  <div className="cs-toggle-desc">Get email alerts when applicants move stages.</div>
                </div>
                <label className="cs-switch">
                  <input
                    type="checkbox"
                    checked={emailUpdatesEnabled}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setEmailUpdatesEnabled(newValue);
                      autoSaveNotificationSettings(newValue, weeklyDigestEnabled);
                    }}
                    disabled={settingsLoading}
                  />
                  <span className="cs-slider" />
                </label>
              </div>

              <div className="cs-toggle-row">
                <div>
                  <div className="cs-toggle-title">Weekly digest</div>
                  <div className="cs-toggle-desc">A summary of applicants, interviews, and open roles.</div>
                </div>
                <label className="cs-switch">
                  <input
                    type="checkbox"
                    checked={weeklyDigestEnabled}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setWeeklyDigestEnabled(newValue);
                      autoSaveNotificationSettings(emailUpdatesEnabled, newValue);
                    }}
                    disabled={settingsLoading}
                  />
                  <span className="cs-slider" />
                </label>
              </div>

              {(settingsError || settingsMessage) && (
                <div className={`cs-alert ${settingsError ? 'cs-alert--error' : 'cs-alert--ok'}`}>
                  {settingsError || settingsMessage}
                </div>
              )}
            </section>

            <section className="cs-card cs-card--wide">
              <h3 className="cs-card-title">Testimonial</h3>
              <p className="cs-card-subtitle">Share your company's experience with NexApply.</p>

              {settingsError && (
                <div className="cs-alert cs-alert--error">{settingsError}</div>
              )}

              <form className="cs-form" onSubmit={onSaveTestimonial}>
                <label className="cs-field">

                  <textarea
                    className="cs-input"
                    rows={4}
                    placeholder="Share how NexApply helped your company find great talent..."
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
      </div>
    </div>
  );
}
