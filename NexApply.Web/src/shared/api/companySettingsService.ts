import type { AxiosError } from 'axios';
import apiClient from './apiClient';
import type { Result } from '@/shared/types/index';

export interface CompanySettingsDto {
  applicantUpdatesEnabled: boolean;
  weeklyDigestEnabled: boolean;
  email: string;
  signInMethod: string;
  hasPassword: boolean;
  testimonial?: string;
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
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load settings',
        statusCode: axiosError.response?.status,
      };
    }
  },

  async updateSettings(data: UpdateCompanySettingsRequest): Promise<Result<CompanySettingsDto>> {
    try {
      const response = await apiClient.put<CompanySettingsDto>('/company/settings', data);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to update settings',
        statusCode: axiosError.response?.status,
      };
    }
  },

  async updateTestimonial(testimonial: string): Promise<Result<void>> {
    try {
      await apiClient.put('/company/settings/testimonial', { testimonial });
      return { isSuccess: true, value: undefined };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to save testimonial',
        statusCode: axiosError.response?.status,
      };
    }
  },
};
