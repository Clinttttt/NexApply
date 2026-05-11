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

export const applicationService = {
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
