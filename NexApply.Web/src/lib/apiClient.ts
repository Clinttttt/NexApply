import axios from 'axios';
import { cookieService } from './cookieService';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Important: Send cookies with requests
});

// REQUEST: Add token to every request (replaces AuthorizationDelegatingHandler)
apiClient.interceptors.request.use((config) => {
  const token = cookieService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE: Handle 401 and refresh token (replaces RefreshTokenDelegatingHandler)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = cookieService.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post('/api/auth/refresh', { refreshToken });
        
        // Store new tokens in cookies
        cookieService.setAccessToken(response.data.accessToken);
        cookieService.setRefreshToken(response.data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        cookieService.clearAuthCookies();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
