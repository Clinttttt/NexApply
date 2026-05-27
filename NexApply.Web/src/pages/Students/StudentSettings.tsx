import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { PageHeader } from '../../components/PageHeader';
import { authService } from '../../services/authService';
import { studentSettingsService } from '../../services/studentSettingsService';
import '../Company/CompanySettings.css';

type StudentPreferenceState = {
  jobAlertsEnabled: boolean;
  messageNotificationsEnabled: boolean;
};

const STORAGE_KEY = 'nexapply.student.settings.v1';

const readPreferences = (): StudentPreferenceState => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { jobAlertsEnabled: true, messageNotificationsEnabled: true };
    const parsed = JSON.parse(raw) as Partial<StudentPreferenceState>;
    return {
      jobAlertsEnabled: parsed.jobAlertsEnabled ?? true,
      messageNotificationsEnabled: parsed.messageNotificationsEnabled ?? true,
    };
  } catch {
    return { jobAlertsEnabled: true, messageNotificationsEnabled: true };
  }
};

const writePreferences = (prefs: StudentPreferenceState) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
};

export default function StudentSettings() {
  const initialPrefs = useMemo(() => readPreferences(), []);
  const [jobAlertsEnabled, setJobAlertsEnabled] = useState(initialPrefs.jobAlertsEnabled);
  const [messageNotificationsEnabled, setMessageNotificationsEnabled] = useState(initialPrefs.messageNotificationsEnabled);
  const [prefsDirty, setPrefsDirty] = useState(false);
  const [prefsMessage, setPrefsMessage] = useState<string | null>(null);

  const [accountEmail, setAccountEmail] = useState<string>('');
  const [signInMethod, setSignInMethod] = useState<string>('Email & Password');
  const [hasPassword, setHasPassword] = useState<boolean>(true);
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [securitySending, setSecuritySending] = useState(false);
  const [passwordSetupStarted, setPasswordSetupStarted] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [settingPassword, setSettingPassword] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);

  const loadAccount = async () => {
    setAccountLoading(true);
    setAccountError(null);

    const result = await studentSettingsService.getSettings();
    if (result.isSuccess && result.value) {
      setAccountEmail(result.value.email || '');
      setSignInMethod(result.value.signInMethod || 'Email & Password');
      setHasPassword(Boolean(result.value.hasPassword));
    } else {
      setAccountError(result.error || 'Failed to load settings.');
    }

    setAccountLoading(false);
  };

  useEffect(() => {
    loadAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss success messages
  useEffect(() => {
    if (!prefsMessage) return;
    const t = window.setTimeout(() => setPrefsMessage(null), 3000);
    return () => window.clearTimeout(t);
  }, [prefsMessage]);

  useEffect(() => {
    if (!passwordMessage) return;
    const t = window.setTimeout(() => setPasswordMessage(null), 3000);
    return () => window.clearTimeout(t);
  }, [passwordMessage]);

  useEffect(() => {
    if (!securityMessage) return;
    const t = window.setTimeout(() => setSecurityMessage(null), 3000);
    return () => window.clearTimeout(t);
  }, [securityMessage]);

  const onSavePreferences = () => {
    writePreferences({ jobAlertsEnabled, messageNotificationsEnabled });
    setPrefsDirty(false);
    setPrefsMessage('Preferences saved.');
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordError(null);
    setPasswordMessage(null);

    const result = await authService.changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (result.isSuccess) {
      setPasswordMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(result.error || 'Failed to change password.');
    }

    setIsSavingPassword(false);
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
      await loadAccount();
    } else {
      setSecurityError(result.error || 'Failed to set password.');
    }

    setSettingPassword(false);
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <PageHeader title="Settings" subtitle="Manage your student preferences" />

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
                      setJobAlertsEnabled(e.target.checked);
                      setPrefsDirty(true);
                      setPrefsMessage(null);
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
                      setMessageNotificationsEnabled(e.target.checked);
                      setPrefsDirty(true);
                      setPrefsMessage(null);
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

              <div className="cs-actions" style={{ justifyContent: 'space-between' }}>
                <span className="cs-card-subtitle" style={{ margin: 0 }}>
                  {prefsDirty ? 'Unsaved changes' : 'Up to date'}
                </span>
                <button
                  className="cs-btn cs-btn--primary"
                  type="button"
                  disabled={!prefsDirty}
                  onClick={onSavePreferences}
                >
                  Save
                </button>
              </div>
            </section>

            {/* Security */}
            <section className="cs-card cs-card--wide">
              <h3 className="cs-card-title">Security</h3>
              <p className="cs-card-subtitle">Keep your account protected.</p>

              <div className="cs-note" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <span><strong>Sign-in method:</strong> {accountLoading ? 'Loading…' : signInMethod}</span>
                  {accountEmail ? <span><strong>Email:</strong> {accountEmail}</span> : null}
                </div>
              </div>

              {accountError ? (
                <div className="cs-alert cs-alert--error">{accountError}</div>
              ) : null}

              {hasPassword ? (
                <form className="cs-form" onSubmit={onChangePassword}>
                  <div className="cs-form-grid">
                    <label className="cs-field">
                      <span className="cs-label">Current password</span>
                      <input
                        className="cs-input"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </label>
                    <label className="cs-field">
                      <span className="cs-label">New password</span>
                      <input
                        className="cs-input"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </label>
                    <label className="cs-field">
                      <span className="cs-label">Confirm new password</span>
                      <input
                        className="cs-input"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </label>
                  </div>

                  {(passwordError || passwordMessage) && (
                    <div className={`cs-alert ${passwordError ? 'cs-alert--error' : 'cs-alert--ok'}`}>
                      {passwordError || passwordMessage}
                    </div>
                  )}

                  <div className="cs-actions">
                    <button className="cs-btn cs-btn--ghost" type="button" onClick={() => authService.logout()}>
                      Log out
                    </button>
                    <button className="cs-btn cs-btn--primary" type="submit" disabled={isSavingPassword}>
                      {isSavingPassword ? 'Saving…' : 'Update password'}
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
                          <input
                            className="cs-input"
                            type="password"
                            value={setupPassword}
                            onChange={(e) => setSetupPassword(e.target.value)}
                            required
                          />
                        </label>
                        <label className="cs-field">
                          <span className="cs-label">Confirm new password</span>
                          <input
                            className="cs-input"
                            type="password"
                            value={setupConfirmPassword}
                            onChange={(e) => setSetupConfirmPassword(e.target.value)}
                            required
                          />
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
      </main>
    </div>
  );
}

