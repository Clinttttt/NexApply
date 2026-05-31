import type { AxiosError } from 'axios';
import apiClient from '../lib/apiClient';
import type { Result } from '../types';

export interface StudentSettingsDto {
  email: string;
  signInMethod: string;
  hasPassword: boolean;
  feedback?: string;
}

export const studentSettingsService = {
  async getSettings(): Promise<Result<StudentSettingsDto>> {
    try {
      const response = await apiClient.get<StudentSettingsDto>('/student/settings');
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

  async updateTestimonial(testimonial: string): Promise<Result<void>> {
    try {
      await apiClient.put('/student/settings/feedback', { feedback: testimonial });
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

