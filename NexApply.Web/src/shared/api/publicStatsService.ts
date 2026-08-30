import { AxiosError } from 'axios';
import apiClient from './apiClient';
import type { Result } from '@/shared/types/index';

export interface PublicStatsDto {
  activeListings: number;
  companies: number;
  students: number;
}

export const publicStatsService = {
  async getStats(): Promise<Result<PublicStatsDto>> {
    try {
      const response = await apiClient.get<PublicStatsDto>('/public/stats');
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to fetch stats',
        statusCode: axiosError.response?.status
      };
    }
  }
};
