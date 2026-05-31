import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import { cookieService } from '../lib/cookieService';
import { authService } from '../services/authService';

type GoogleAuthRole = 'Student' | 'Recruiter';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdentity {
  accounts?: {
    id?: unknown;
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
    googleConfig: { clientId: string };
    initGoogleSignIn: () => boolean;
    promptGoogleOneTap: () => void;
    renderGoogleButton: (elementId: string) => boolean;
    handleGoogleCallback: (response: GoogleCredentialResponse) => void;
  }
}

const GOOGLE_READY_TIMEOUT_MS = 8000;
const GOOGLE_READY_POLL_MS = 100;

const isGoogleSdkReady = () =>
  Boolean(window.google?.accounts?.id);

const isGoogleRenderReady = () =>
  isGoogleSdkReady()
  && typeof window.initGoogleSignIn === 'function'
  && typeof window.renderGoogleButton === 'function';

export function useGoogleOneTap(activeRole: GoogleAuthRole = 'Student') {
  const navigate = useNavigate();

  const handleGoogleCallback = useCallback(async (response: GoogleCredentialResponse) => {
    const idToken = response.credential;

    try {
      const result = await apiClient.post('/auth/login-google', {
        idToken,
        // 0 = Student, 1 = Company (backend enum)
        role: activeRole === 'Recruiter' ? 1 : 0
      });

      if (result.data.accessToken && result.data.refreshToken) {
        cookieService.setAccessToken(result.data.accessToken);
        cookieService.setRefreshToken(result.data.refreshToken);
        navigate(authService.getDefaultDashboardRoute());
      }
    } catch (error) {
      console.error('Google login failed:', error);
    }
  }, [activeRole, navigate]);

  useEffect(() => {
    window.handleGoogleCallback = handleGoogleCallback;

    let cancelled = false;
    const startedAt = Date.now();

    const initializeWhenReady = () => {
      if (cancelled) return;

      if (isGoogleSdkReady() && typeof window.initGoogleSignIn === 'function') {
        window.initGoogleSignIn();
        return;
      }

      if (Date.now() - startedAt < GOOGLE_READY_TIMEOUT_MS) {
        window.setTimeout(initializeWhenReady, GOOGLE_READY_POLL_MS);
      } else {
        console.error('Google Sign-In SDK did not become ready in time.');
      }
    };

    initializeWhenReady();

    return () => {
      cancelled = true;
    };
  }, [handleGoogleCallback]);

  const promptOneTap = useCallback(() => {
    if (window.promptGoogleOneTap) {
      window.promptGoogleOneTap();
    }
  }, []);

  const renderButton = useCallback((elementId: string) => {
    let cancelled = false;
    const startedAt = Date.now();

    const renderWhenReady = () => {
      if (cancelled) return;

      const target = document.getElementById(elementId);
      if (target && isGoogleRenderReady()) {
        window.initGoogleSignIn();
        window.renderGoogleButton(elementId);
        return;
      }

      if (Date.now() - startedAt < GOOGLE_READY_TIMEOUT_MS) {
        window.setTimeout(renderWhenReady, GOOGLE_READY_POLL_MS);
      } else {
        console.error(`Google Sign-In button could not render into #${elementId}.`);
      }
    };

    renderWhenReady();

    return () => {
      cancelled = true;
    };
  }, []);

  return { promptOneTap, renderButton };
}
