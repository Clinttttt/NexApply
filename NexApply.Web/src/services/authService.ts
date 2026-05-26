import apiClient from '../lib/apiClient';
import { cookieService } from '../lib/cookieService';

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

export interface Result<T> {
  isSuccess: boolean;
  value?: T;
  error?: string;
  statusCode?: number;
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
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Registration failed',
        statusCode: error.response?.status
      };
    }
  },

  async changePassword(data: ChangePasswordRequest): Promise<Result<string>> {
    try {
      const response = await apiClient.put<string>('/auth/change-password', data);
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to change password',
        statusCode: error.response?.status
      };
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<Result<string>> {
    try {
      const response = await apiClient.post<string>('/auth/forgot-password', data);
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to send password reset email',
        statusCode: error.response?.status
      };
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<Result<string>> {
    try {
      const response = await apiClient.post<string>('/auth/reset-password', data);
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to set password',
        statusCode: error.response?.status
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
};
