import apiClient from '../lib/apiClient';
import type { Result } from '../types';

export interface StudentSettingsDto {
  email: string;
  signInMethod: string;
  hasPassword: boolean;
}

export const studentSettingsService = {
  async getSettings(): Promise<Result<StudentSettingsDto>> {
    try {
      const response = await apiClient.get<StudentSettingsDto>('/student/settings');
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || 'Failed to load settings',
        statusCode: error.response?.status,
      };
    }
  },
};

