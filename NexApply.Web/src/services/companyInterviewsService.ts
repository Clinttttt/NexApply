import apiClient from '../lib/apiClient';
import type { Result } from '../types';

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
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to load interviews',
        statusCode: error.response?.status
      };
    }
  },

  async scheduleInterview(command: ScheduleInterviewCommand): Promise<Result<InterviewDto>> {
    try {
      const response = await apiClient.post<InterviewDto>('/company/interviews', command);
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to schedule interview',
        statusCode: error.response?.status
      };
    }
  }
};
