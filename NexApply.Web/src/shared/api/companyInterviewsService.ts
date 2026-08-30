import type { AxiosError } from 'axios';
import apiClient from './apiClient';
import type { Result } from '@/shared/types/index';

export interface InterviewDto {
  id: string;
  candidateName: string;
  jobTitle: string;
  scheduledAt: string;
  durationMinutes: number;
  format: string;
  status: string;
  location?: string;
  meetingLink?: string;
  interviewers: string[];
  notes?: string;
  feedback?: string;
  rating?: number;
  recommendation?: string;
}

export interface CompanyInterviewsDto {
  interviews: InterviewDto[];
}

export interface ScheduleInterviewCommand {
  applicationId?: string;
  studentId?: string;
  jobListingId?: string;
  scheduledAt: string;
  durationMinutes: number;
  format: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  interviewerNames: string[];
}

export const companyInterviewsService = {
  async getInterviews(): Promise<Result<CompanyInterviewsDto>> {
    try {
      const response = await apiClient.get<CompanyInterviewsDto>('/company/interviews');
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load interviews',
        statusCode: axiosError.response?.status
      };
    }
  },

  async scheduleInterview(command: ScheduleInterviewCommand): Promise<Result<InterviewDto>> {
    try {
      const response = await apiClient.post<InterviewDto>('/company/interviews', command);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to schedule interview',
        statusCode: axiosError.response?.status
      };
    }
  }
};
