import { useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/shared/api/authService';
import { AuthLeftPanel } from '@/features/auth/components/AuthLeftPanel';
import { useGoogleOneTap } from '@/features/auth/hooks/useGoogleOneTap';
import './auth.css';

export function Login() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<'Student' | 'Recruiter'>('Student');
  const { renderButton } = useGoogleOneTap(activeRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.login({ email, password });
      navigate(authService.getDefaultDashboardRoute());
    } catch {
      setErrorMessage('Invalid email or password. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  useEffect(() => {
    return renderButton('google-signin-button');
  }, [renderButton, activeRole]);

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="login-shell">
      <AuthLeftPanel
        title='Your next<br/><span class="left-title-accent">opportunity</span><br/>starts here.'
        subtitle="Browse thousands of listings, track your applications, and let your resume match you to roles automatically."
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
            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">Sign in to continue to NexApply</p>
          </div>

          <div className="role-toggle" role="group" aria-label="Sign in as">
            <button
              className={`role-btn ${activeRole === 'Student' ? 'active' : ''}`}
              onClick={() => setActiveRole('Student')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              Student
            </button>
            <button
              className={`role-btn ${activeRole === 'Recruiter' ? 'active' : ''}`}
              onClick={() => setActiveRole('Recruiter')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              Recruiter
            </button>
          </div>

          <div id="google-signin-button" style={{ width: '100%' }}></div>

          <div className="form-divider">
            <div className="divider-line"></div>
            <span className="divider-label">or sign in with email</span>
            <div className="divider-line"></div>
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

          <div className="form-fields">

            <div className="field-group">
              <label className="field-label" htmlFor="login-password">Password</label>
              <div className="field-wrap">
                <div className="field-prefix">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  id="login-password"
                  className="field-input field-input--prefixed"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
              <label className="field-label" htmlFor="login-email">Email address</label>
              <div className="field-wrap">
                <div className="field-prefix">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  id="login-email"
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
          </div>

          <div className="form-options">
            <label className="remember-label">
              <input
                type="checkbox"
                className="remember-check"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Keep me signed in
            </label>
            <button className="forgot-btn" type="button" onClick={handleForgotPassword}>
              Forgot password?
            </button>
          </div>

          <button className="submit-btn" type="button" onClick={handleLogin} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="submit-spinner"></span>
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                <span>Sign in</span>
              </>
            )}
          </button>

          <p className="signup-hint">
            Don't have an account?
            <Link to="/register" className="signup-link"> Create one — it's free</Link>
          </p>

          <p className="terms-hint">
            By signing in, you agree to our
            <Link to="/terms" className="terms-link">Terms of Service</Link>
            and
            <Link to="/privacy" className="terms-link">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
