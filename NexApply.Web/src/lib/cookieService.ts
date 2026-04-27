import Cookies from 'js-cookie';

// Cookie configuration
const COOKIE_OPTIONS = {
  secure: import.meta.env.PROD, // true in production, false in dev
  sameSite: 'strict' as const,
};

export const cookieService = {
  // Set access token (short-lived)
  setAccessToken(token: string) {
    Cookies.set('accessToken', token, {
      ...COOKIE_OPTIONS,
      expires: 1, // 1 day
    });
  },

  // Set refresh token (long-lived)
  setRefreshToken(token: string) {
    Cookies.set('refreshToken', token, {
      ...COOKIE_OPTIONS,
      expires: 7, // 7 days
    });
  },

  // Get access token
  getAccessToken(): string | undefined {
    return Cookies.get('accessToken');
  },

  // Get refresh token
  getRefreshToken(): string | undefined {
    return Cookies.get('refreshToken');
  },

  // Remove all auth cookies
  clearAuthCookies() {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};
