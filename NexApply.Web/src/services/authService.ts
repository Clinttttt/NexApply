import type { AxiosError } from 'axios';
import apiClient from '../lib/apiClient';
import { cookieService } from '../lib/cookieService';
import type { Result } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 0 | 1; // 0 = Student, 1 = Company
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetCode: string;
  newPassword: string;
  confirmPassword: string;
}

type UserRole = 'Student' | 'Company';

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  const payload = parts[1]
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');

  try {
    const json = atob(payload);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const getRoleFromPayload = (payload: Record<string, unknown>): UserRole | undefined => {
  const direct = payload.role;
  if (typeof direct === 'string' && (direct === 'Student' || direct === 'Company')) return direct;

  const claim =
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    payload['https://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

  if (typeof claim === 'string' && (claim === 'Student' || claim === 'Company')) return claim;
  return undefined;
};

export const authService = {
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/login', data);
    
    cookieService.setAccessToken(response.data.accessToken);
    cookieService.setRefreshToken(response.data.refreshToken);
    
    return response.data;
  },

  async register(data: RegisterRequest): Promise<Result<TokenResponse>> {
    try {
      const response = await apiClient.post<TokenResponse>('/auth/register', data);
      
      cookieService.setAccessToken(response.data.accessToken);
      cookieService.setRefreshToken(response.data.refreshToken);
      
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Registration failed',
        statusCode: axiosError.response?.status
      };
    }
  },

  async changePassword(data: ChangePasswordRequest): Promise<Result<string>> {
    try {
      const response = await apiClient.put<string>('/auth/change-password', data);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to change password',
        statusCode: axiosError.response?.status
      };
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<Result<string>> {
    try {
      const response = await apiClient.post<string>('/auth/forgot-password', data);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to send password reset email',
        statusCode: axiosError.response?.status
      };
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<Result<string>> {
    try {
      const response = await apiClient.post<string>('/auth/reset-password', data);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to set password',
        statusCode: axiosError.response?.status
      };
    }
  },

  logout() {
    cookieService.clearAuthCookies();
    window.location.href = '/login';
  },

  getToken(): string | undefined {
    return cookieService.getAccessToken();
  },

  isAuthenticated(): boolean {
    return cookieService.isAuthenticated();
  },

  getUserRole(): UserRole | undefined {
    const token = cookieService.getAccessToken();
    if (!token) return undefined;
    const payload = decodeJwtPayload(token);
    if (!payload) return undefined;
    return getRoleFromPayload(payload);
  },

  getDefaultDashboardRoute(): string {
    return authService.getUserRole() === 'Company' ? '/company-dashboard' : '/dashboard';
  },
};
