import axios from 'axios';
import { cookieService } from '@/shared/lib/cookieService';

const apiClient = axios.create({
  baseURL: 'https://nexapply-clint-villanueva-hfamdpa2fma3fndr.southeastasia-01.azurewebsites.net/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = cookieService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
