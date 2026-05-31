import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { AuthLeftPanel } from '../../components/AuthLeftPanel';
import { useGoogleOneTap } from '../../hooks/useGoogleOneTap';
import './auth.css';

type UserRole = 'Student' | 'Recruiter';

export default function Register() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<UserRole>('Student');
  const { renderButton } = useGoogleOneTap(activeRole);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getPasswordStrength = (): number => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];
  const strengthColor = ['', 'red', 'amber', 'blue', 'green'][passwordStrength];

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!displayName.trim()) {
      setErrorMessage(activeRole === 'Student' ? 'Please enter your full name.' : 'Please enter your company name.');
      return;
    }

    if (!username.trim()) {
      setErrorMessage('Please choose a username.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!agreeToTerms) {
      setErrorMessage('Please agree to the Terms of Service to continue.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.register({
        fullName: displayName,
        username,
        email,
        password,
        confirmPassword,
        role: activeRole === 'Recruiter' ? 1 : 0
      });

      if (result.isSuccess) {
        navigate(authService.getDefaultDashboardRoute());
      } else {
        setErrorMessage(result.error || 'Registration failed. Please try again.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return renderButton('google-signup-button');
  }, [renderButton, activeRole]);

  return (
    <div className="login-shell">
      <AuthLeftPanel
        eyebrow="Join 12,000+ students today"
        title='Your career<br/><span class="left-title-accent">journey</span><br/>begins now.'
        subtitle="Create your free account and get matched to internships and jobs that fit your skills automatically."
      />

      <main className="login-right login-right--scroll">
        <div className="login-form-wrap">
          {/* Mobile brand */}
          <div className="mobile-brand">
            <div className="brand-logo brand-logo--dark">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" fill="#1D4ED8"/>
                <path d="M10 10V18M10 10L18 18M18 18V10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="brand-name brand-name--dark">NexApply</span>
          </div>

          <h2 className="form-title">Create account</h2>
          <p className="form-sub">Start for free — no credit card needed</p>

          {/* Role Switcher */}
          <div className="role-switcher">
            <button
              className={`role-btn ${activeRole === 'Student' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveRole('Student')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              Student
            </button>
            <button
              className={`role-btn ${activeRole === 'Recruiter' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveRole('Recruiter')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              Recruiter
            </button>
          </div>

          {/* Google */}
          <div id="google-signup-button" style={{ width: '100%' }}></div>

          {/* Divider */}
          <div className="form-divider">
            <div className="divider-line"></div>
            <span className="divider-label">or sign up with email</span>
            <div className="divider-line"></div>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="error-banner">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errorMessage}
            </div>
          )}

          {/* Form Fields */}
          <div className="form-fields">
            {/* Name */}
            <div className="field-group">
              <label className="field-label" htmlFor="reg-name">
                {activeRole === 'Student' ? 'Full name' : 'Company name'}
              </label>
              <div className="field-wrap">
                <div className="field-prefix">
                  {activeRole === 'Student' ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                  )}
                </div>
                <input
                  id="reg-name"
                  className="field-input field-input--prefixed"
                  type="text"
                  placeholder={activeRole === 'Student' ? 'Juan dela Cruz' : 'Acme Corp'}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Username */}
            <div className="field-group">
              <label className="field-label" htmlFor="reg-username">Username</label>
              <div className="field-wrap">
                <div className="field-prefix">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="field-prefix field-at-prefix">@</div>
                <input
                  id="reg-username"
                  className="field-input field-input--at-prefixed"
                  type="text"
                  placeholder="juandelacruz"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Email */}
            <div className="field-group">
              <label className="field-label" htmlFor="reg-email">Email address</label>
              <div className="field-wrap">
                <div className="field-prefix">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  id="reg-email"
                  className="field-input field-input--prefixed"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label" htmlFor="reg-password">Password</label>
              <div className="field-wrap">
                <div className="field-prefix">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  id="reg-password"
                  className="field-input field-input--prefixed"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  className="field-suffix eye-toggle"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {password && (
                <div className="strength-wrap">
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`strength-bar ${level <= passwordStrength ? `strength-bar--${strengthColor}` : ''}`}
                      />
                    ))}
                  </div>
                  <span className={`strength-label strength-label--${strengthColor}`}>{strengthLabel}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="field-group">
              <label className="field-label" htmlFor="reg-confirm">Confirm password</label>
              <div className="field-wrap">
                <div className="field-prefix">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  id="reg-confirm"
                  className={`field-input field-input--prefixed ${confirmPassword && confirmPassword !== password ? 'field-input--error' : ''}`}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  className="field-suffix eye-toggle"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <span className="field-hint field-hint--error">Passwords do not match.</span>
              )}
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="terms-check-row">
            <label className="remember-label">
              <input type="checkbox" className="remember-check" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} />
              I agree to the
              <Link to="/terms" className="signup-link">Terms of Service</Link>
              and
              <Link to="/privacy" className="signup-link">Privacy Policy</Link>
            </label>
          </div>

          {/* Submit */}
          <button className="submit-btn" type="button" onClick={handleRegister} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="submit-spinner"></span>
                <span>Creating account…</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                <span>Create account</span>
              </>
            )}
          </button>

          {/* Sign in link */}
          <p className="signup-hint">
            Already have an account?
            <Link to="/login" className="signup-link"> Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
