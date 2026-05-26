import apiClient from '../lib/apiClient';
import type { Result } from '../types';

export interface CompanySettingsDto {
  applicantUpdatesEnabled: boolean;
  weeklyDigestEnabled: boolean;
  email: string;
  signInMethod: string;
  hasPassword: boolean;
}

export interface UpdateCompanySettingsRequest {
  applicantUpdatesEnabled: boolean;
  weeklyDigestEnabled: boolean;
}

export const companySettingsService = {
  async getSettings(): Promise<Result<CompanySettingsDto>> {
    try {
      const response = await apiClient.get<CompanySettingsDto>('/company/settings');
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || 'Failed to load settings',
        statusCode: error.response?.status,
      };
    }
  },

  async updateSettings(data: UpdateCompanySettingsRequest): Promise<Result<CompanySettingsDto>> {
    try {
      const response = await apiClient.put<CompanySettingsDto>('/company/settings', data);
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || 'Failed to update settings',
        statusCode: error.response?.status,
      };
    }
  },
};
