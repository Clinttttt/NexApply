import Cookies from 'js-cookie';

const COOKIE_OPTIONS = {
  secure: import.meta.env.PROD,
  sameSite: 'strict' as const,
};

export const cookieService = {
  setAccessToken(token: string) {
    Cookies.set('accessToken', token, {
      ...COOKIE_OPTIONS,
      expires: 1,
    });
  },

  setRefreshToken(token: string) {
    Cookies.set('refreshToken', token, {
      ...COOKIE_OPTIONS,
      expires: 7,
    });
  },

  getAccessToken(): string | undefined {
    return Cookies.get('accessToken');
  },

  getRefreshToken(): string | undefined {
    return Cookies.get('refreshToken');
  },

  clearAuthCookies() {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};
