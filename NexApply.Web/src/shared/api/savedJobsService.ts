import { AxiosError } from 'axios';
import apiClient from './apiClient';
import type { Result } from '@/shared/types/index';

export interface SavedJobDto {
  savedJobId: string;
  jobListingId: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  workSetup: string;
  salary: string;
  postedAt: string;
  savedAt: string;
  hasApplied: boolean;
  skills: string[];
  description: string;
}

export const savedJobsService = {
  async getSavedJobs(): Promise<Result<SavedJobDto[]>> {
    try {
      const response = await apiClient.get<SavedJobDto[]>('/saved-jobs');
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load saved jobs',
        statusCode: axiosError.response?.status
      };
    }
  },

  async saveJob(jobListingId: string): Promise<Result<boolean>> {
    try {
      const response = await apiClient.post<boolean>('/saved-jobs', { jobListingId });
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to save job',
        statusCode: axiosError.response?.status
      };
    }
  },

  async unsaveJob(jobListingId: string): Promise<Result<boolean>> {
    try {
      const response = await apiClient.delete<boolean>(`/saved-jobs/${jobListingId}`);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to remove saved job',
        statusCode: axiosError.response?.status
      };
    }
  }
};
