import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CompanySidebar } from '../../components/CompanySidebar';
import { CompanyHeader } from '../../components/CompanyHeader';
import { authService } from '../../services/authService';
import { companySettingsService } from '../../services/companySettingsService';
import './CompanySettings.css';

export default function CompanySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [accountEmail, setAccountEmail] = useState<string>('');
  const [signInMethod, setSignInMethod] = useState<string>('Email & Password');
  const [hasPassword, setHasPassword] = useState<boolean>(true);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySending, setSecuritySending] = useState(false);
  const [passwordSetupStarted, setPasswordSetupStarted] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [settingPassword, setSettingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [showSetupPassword, setShowSetupPassword] = useState(false);
  const [showSetupConfirmPassword, setShowSetupConfirmPassword] = useState(false);

  const [emailUpdatesEnabled, setEmailUpdatesEnabled] = useState(false);
  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(false);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setSettingsLoading(true);
      setSettingsError(null);

      const result = await companySettingsService.getSettings();
      if (result.isSuccess && result.value) {
        setEmailUpdatesEnabled(result.value.applicantUpdatesEnabled);
        setWeeklyDigestEnabled(result.value.weeklyDigestEnabled);
        setAccountEmail(result.value.email || '');
        setSignInMethod(result.value.signInMethod || 'Email & Password');
        setHasPassword(Boolean(result.value.hasPassword));
        setSettingsDirty(false);
      } else {
        setSettingsError(result.error || 'Failed to load settings.');
      }

      setSettingsLoading(false);
    };

    load();
  }, []);

  // Auto-dismiss success toast after 3s
  useEffect(() => {
    if (!settingsMessage) return;
    const t = window.setTimeout(() => setSettingsMessage(null), 3000);
    return () => window.clearTimeout(t);
  }, [settingsMessage]);

  // Auto-dismiss security success toast after 3s
  useEffect(() => {
    if (!securityMessage) return;
    const t = window.setTimeout(() => setSecurityMessage(null), 3000);
    return () => window.clearTimeout(t);
  }, [securityMessage]);

  const onSaveNotificationSettings = async () => {
    setSettingsSaving(true);
    setSettingsError(null);
    setSettingsMessage(null);

    const result = await companySettingsService.updateSettings({
      applicantUpdatesEnabled: emailUpdatesEnabled,
      weeklyDigestEnabled,
    });

    if (result.isSuccess && result.value) {
      setEmailUpdatesEnabled(result.value.applicantUpdatesEnabled);
      setWeeklyDigestEnabled(result.value.weeklyDigestEnabled);
      setAccountEmail(result.value.email || '');
      setSignInMethod(result.value.signInMethod || 'Email & Password');
      setHasPassword(Boolean(result.value.hasPassword));
      setSettingsDirty(false);
      setSettingsMessage('Notification preferences saved.');
    } else {
      setSettingsError(result.error || 'Failed to save settings.');
    }

    setSettingsSaving(false);
  };

  const onSendPasswordSetupEmail = async () => {
    if (!accountEmail) return;
    setSecuritySending(true);
    setSecurityError(null);
    setSecurityMessage(null);

    const result = await authService.forgotPassword({ email: accountEmail });
    if (result.isSuccess) {
      setSecurityMessage('Verification code sent.');
      setPasswordSetupStarted(true);
    } else {
      setSecurityError(result.error || 'Failed to send password setup email.');
    }

    setSecuritySending(false);
  };

  const onSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountEmail) return;

    setSettingPassword(true);
    setSecurityError(null);
    setSecurityMessage(null);

    const result = await authService.resetPassword({
      email: accountEmail,
      resetCode,
      newPassword: setupPassword,
      confirmPassword: setupConfirmPassword,
    });

    if (result.isSuccess) {
      setSecurityMessage('Password set successfully.');
      setResetCode('');
      setSetupPassword('');
      setSetupConfirmPassword('');
      setPasswordSetupStarted(false);

      // Refresh settings so UI switches from "Google One Tap" -> "Email & Password"
      const refreshed = await companySettingsService.getSettings();
      if (refreshed.isSuccess && refreshed.value) {
        setAccountEmail(refreshed.value.email || '');
        setSignInMethod(refreshed.value.signInMethod || 'Email & Password');
        setHasPassword(Boolean(refreshed.value.hasPassword));
      }
    } else {
      setSecurityError(result.error || 'Failed to set password.');
    }

    setSettingPassword(false);
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    const result = await authService.changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (result.isSuccess) {
      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(result.error || 'Failed to change password.');
    }

    setIsSaving(false);
  };

  return (
    <div className="app-shell">
      <CompanySidebar />

      <div className="main-content">
        <CompanyHeader title="Settings" subtitle="Manage your recruiter workspace preferences" />

        <div className="page-body cs-page">
          <div className="cs-grid">
            {/* Company */}
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

            {/* Notifications */}
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
                      setEmailUpdatesEnabled(e.target.checked);
                      setSettingsDirty(true);
                      setSettingsMessage(null);
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
                      setWeeklyDigestEnabled(e.target.checked);
                      setSettingsDirty(true);
                      setSettingsMessage(null);
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

              <div className="cs-actions" style={{ justifyContent: 'space-between' }}>
                <span className="cs-card-subtitle" style={{ margin: 0 }}>
                  {settingsLoading ? 'Loading preferences…' : settingsDirty ? 'Unsaved changes' : 'Up to date'}
                </span>
                <button
                  className="cs-btn cs-btn--primary"
                  type="button"
                  disabled={settingsLoading || settingsSaving || !settingsDirty}
                  onClick={onSaveNotificationSettings}
                >
                  {settingsSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </section>

            {/* Security */}
            <section className="cs-card cs-card--wide">
              <h3 className="cs-card-title">Security</h3>
              <p className="cs-card-subtitle">Keep your account protected.</p>

              <div className="cs-note" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <span><strong>Sign-in method:</strong> {signInMethod}</span>
                  {accountEmail ? <span><strong>Email:</strong> {accountEmail}</span> : null}
                </div>
              </div>

              {hasPassword ? (
                <form className="cs-form" onSubmit={onChangePassword}>
                  <div className="cs-form-grid">
                    <label className="cs-field">
                      <span className="cs-label">Current password</span>
                      <div className="cs-input-wrap">
                        <input
                          className="cs-input cs-input--with-toggle"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                        <button
                          className="cs-eye-toggle"
                          type="button"
                          onClick={() => setShowCurrentPassword((v) => !v)}
                          aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                        >
                          {showCurrentPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                              <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </label>
                    <label className="cs-field">
                      <span className="cs-label">New password</span>
                      <div className="cs-input-wrap">
                        <input
                          className="cs-input cs-input--with-toggle"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <button
                          className="cs-eye-toggle"
                          type="button"
                          onClick={() => setShowNewPassword((v) => !v)}
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </label>
                    <label className="cs-field">
                      <span className="cs-label">Confirm new password</span>
                      <div className="cs-input-wrap">
                        <input
                          className="cs-input cs-input--with-toggle"
                          type={showConfirmNewPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <button
                          className="cs-eye-toggle"
                          type="button"
                          onClick={() => setShowConfirmNewPassword((v) => !v)}
                          aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmNewPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                              <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </label>
                  </div>

                  {(error || message) && (
                    <div className={`cs-alert ${error ? 'cs-alert--error' : 'cs-alert--ok'}`}>
                      {error || message}
                    </div>
                  )}

                  <div className="cs-actions">
                    <button className="cs-btn cs-btn--ghost" type="button" onClick={() => authService.logout()}>
                      Log out
                    </button>
                    <button className="cs-btn cs-btn--primary" type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving…' : 'Update password'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="cs-note" style={{ marginBottom: 12 }}>
                    This account was created using Google One Tap and doesn’t have a password yet. To enable email sign-in,
                    request a verification code and set a password below.
                  </div>

                  {(securityError || securityMessage) && (
                    <div className={`cs-alert ${securityError ? 'cs-alert--error' : 'cs-alert--ok'}`}>
                      {securityError || securityMessage}
                    </div>
                  )}

                  <div className="cs-actions" style={{ justifyContent: 'space-between' }}>
                    <button className="cs-btn cs-btn--ghost" type="button" onClick={() => authService.logout()}>
                      Log out
                    </button>
                    <button
                      className="cs-btn cs-btn--primary"
                      type="button"
                      disabled={!accountEmail || securitySending}
                      onClick={onSendPasswordSetupEmail}
                    >
                      {securitySending ? 'Sending…' : (passwordSetupStarted ? 'Resend code' : 'Send code')}
                    </button>
                  </div>

                  {passwordSetupStarted && (
                    <form className="cs-form" onSubmit={onSetPassword}>
                      <div className="cs-form-grid">
                        <label className="cs-field">
                          <span className="cs-label">Verification code</span>
                          <input
                            className="cs-input"
                            inputMode="numeric"
                            placeholder="6-digit code"
                            value={resetCode}
                            onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                          />
                        </label>
                        <label className="cs-field">
                          <span className="cs-label">New password</span>
                          <div className="cs-input-wrap">
                            <input
                              className="cs-input cs-input--with-toggle"
                              type={showSetupPassword ? 'text' : 'password'}
                              value={setupPassword}
                              onChange={(e) => setSetupPassword(e.target.value)}
                              required
                            />
                            <button
                              className="cs-eye-toggle"
                              type="button"
                              onClick={() => setShowSetupPassword((v) => !v)}
                              aria-label={showSetupPassword ? 'Hide password' : 'Show password'}
                            >
                              {showSetupPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                  <line x1="1" y1="1" x2="23" y2="23"/>
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                              )}
                            </button>
                          </div>
                        </label>
                        <label className="cs-field">
                          <span className="cs-label">Confirm new password</span>
                          <div className="cs-input-wrap">
                            <input
                              className="cs-input cs-input--with-toggle"
                              type={showSetupConfirmPassword ? 'text' : 'password'}
                              value={setupConfirmPassword}
                              onChange={(e) => setSetupConfirmPassword(e.target.value)}
                              required
                            />
                            <button
                              className="cs-eye-toggle"
                              type="button"
                              onClick={() => setShowSetupConfirmPassword((v) => !v)}
                              aria-label={showSetupConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                              {showSetupConfirmPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                  <line x1="1" y1="1" x2="23" y2="23"/>
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                              )}
                            </button>
                          </div>
                        </label>
                      </div>

                      <div className="cs-actions">
                        <button
                          className="cs-btn cs-btn--primary"
                          type="submit"
                          disabled={settingPassword}
                        >
                          {settingPassword ? 'Saving…' : 'Set password'}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
