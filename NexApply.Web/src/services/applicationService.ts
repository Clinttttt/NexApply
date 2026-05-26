import { AxiosError } from 'axios';
import apiClient from '../lib/apiClient';
import type { Result } from '../types';

export interface ApplyCommand {
  jobListingId: string;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface ApplyResponseDto {
  applicationId: string;
  jobListingId: string;
  status: string;
  appliedAt: string;
}

export interface StudentApplicationDto {
  applicationId: string;
  jobListingId: string;
  jobTitle: string;
  companyName: string;
  status: string; // "Under Review", "For Interview", etc.
  pipelineStage: number; // 0..4
  jobType: string; // "Full-time", "Internship", etc.
  location: string;
  appliedAt: string; // ISO string
}

export const applicationService = {
  async getMyApplications(): Promise<Result<StudentApplicationDto[]>> {
    try {
      const response = await apiClient.get<StudentApplicationDto[]>('/applications');
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load applications',
        statusCode: axiosError.response?.status
      };
    }
  },

  async apply(command: ApplyCommand): Promise<Result<ApplyResponseDto>> {
    try {
      const response = await apiClient.post<ApplyResponseDto>('/applications', command);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to submit application',
        statusCode: axiosError.response?.status
      };
    }
  }
};
