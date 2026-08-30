import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/shared/api/authService';
import { AuthLeftPanel } from '@/features/auth/components/AuthLeftPanel';
import './auth.css';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendCode = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.forgotPassword({ email });
      if (result.isSuccess) {
        setSuccessMessage('Reset code sent! Check your email.');
        setStep('code');
      } else {
        setErrorMessage(result.error || 'Failed to send reset code.');
      }
    } catch {
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!code.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.resetPassword({
        email,
        resetCode: code,
        newPassword,
        confirmPassword,
      });
      if (result.isSuccess) {
        setSuccessMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setErrorMessage(result.error || 'Failed to reset password.');
      }
    } catch {
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (step === 'email') {
        handleSendCode();
      } else {
        handleResetPassword();
      }
    }
  };

  return (
    <div className="login-shell">
      <AuthLeftPanel
        title='Reset your<br/><span class="left-title-accent">password</span>'
        subtitle="Enter your email to receive a reset code, then create a new password."
      />

      <main className="login-right login-right--no-scroll">
        <div className="login-form-wrap">

          <div className="mobile-brand">
            <div className="brand-logo brand-logo--dark">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" fill="#1D4ED8"/>
                <path d="M10 10V18M10 10L18 18M18 18V10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="brand-name brand-name--dark">NexApply</span>
          </div>

          <div className="form-head">
            <h2 className="form-title">
              {step === 'email' ? 'Forgot password?' : 'Reset password'}
            </h2>
            <p className="form-subtitle">
              {step === 'email'
                ? 'Enter your email and we will send you a reset code'
                : 'Enter the code from your email and your new password'}
            </p>
          </div>

          {errorMessage && (
            <div className="error-banner" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="error-banner" role="alert" style={{ backgroundColor: '#10b981', borderColor: '#059669' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {successMessage}
            </div>
          )}

          <div className="form-fields">
            {step === 'email' ? (

              <div className="field-group">
                <label className="field-label" htmlFor="reset-email">Email address</label>
                <div className="field-wrap">
                  <div className="field-prefix">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <input
                    id="reset-email"
                    className="field-input field-input--prefixed"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleEnterKey}
                    autoComplete="email"
                  />
                </div>
              </div>
            ) : (

              <>
                <div className="field-group">
                  <label className="field-label" htmlFor="reset-code">Reset code</label>
                  <div className="field-wrap">
                    <div className="field-prefix">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                           fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      id="reset-code"
                      className="field-input field-input--prefixed"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="new-password">New password</label>
                  <div className="field-wrap">
                    <div className="field-prefix">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                           fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      id="new-password"
                      className="field-input field-input--prefixed"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      className="field-suffix eye-toggle"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="confirm-password">Confirm password</label>
                  <div className="field-wrap">
                    <div className="field-prefix">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                           fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      id="confirm-password"
                      className="field-input field-input--prefixed"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={handleEnterKey}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            className="submit-btn"
            type="button"
            onClick={step === 'email' ? handleSendCode : handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="submit-spinner"></span>
                <span>{step === 'email' ? 'Sending...' : 'Resetting...'}</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {step === 'email' ? (
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  ) : (
                    <polyline points="20 6 9 17 4 12"/>
                  )}
                </svg>
                <span>{step === 'email' ? 'Send reset code' : 'Reset password'}</span>
              </>
            )}
          </button>

          <p className="signup-hint">
            Remember your password?
            <Link to="/login" className="signup-link"> Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
