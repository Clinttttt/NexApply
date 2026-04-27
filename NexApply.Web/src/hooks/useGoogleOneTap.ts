import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import { cookieService } from '../lib/cookieService';

declare global {
  interface Window {
    google: any;
    googleConfig: { clientId: string };
    initGoogleSignIn: () => void;
    promptGoogleOneTap: () => void;
    renderGoogleButton: (elementId: string) => void;
    handleGoogleCallback: (response: any) => void;
  }
}

export function useGoogleOneTap() {
  const navigate = useNavigate();

  const handleGoogleCallback = useCallback(async (response: any) => {
    const idToken = response.credential;

    try {
      const result = await apiClient.post('/auth/login-google', {
        idToken: idToken
      });

      if (result.data.accessToken && result.data.refreshToken) {
        cookieService.setAccessToken(result.data.accessToken);
        cookieService.setRefreshToken(result.data.refreshToken);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google login failed:', error);
    }
  }, [navigate]);

  useEffect(() => {
    // Set callback globally
    window.handleGoogleCallback = handleGoogleCallback;

    // Initialize Google Sign-In when SDK loads
    const initGoogle = () => {
      if (window.google && window.google.accounts) {
        window.initGoogleSignIn();
      }
    };

    // Check if SDK already loaded
    if (window.google) {
      initGoogle();
    } else {
      // Wait for SDK to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          initGoogle();
          clearInterval(checkGoogle);
        }
      }, 100);

      return () => clearInterval(checkGoogle);
    }
  }, [handleGoogleCallback]);

  const promptOneTap = useCallback(() => {
    if (window.promptGoogleOneTap) {
      window.promptGoogleOneTap();
    }
  }, []);

  const renderButton = useCallback((elementId: string) => {
    if (window.renderGoogleButton) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        window.renderGoogleButton(elementId);
      }, 100);
    }
  }, []);

  return { promptOneTap, renderButton };
}
