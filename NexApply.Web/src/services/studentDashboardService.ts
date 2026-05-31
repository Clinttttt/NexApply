import apiClient from '../lib/apiClient';
import { AxiosError } from 'axios';
import type { Result } from '../types';

export interface StudentDashboardApplicationDto {
  applicationId: string;
  jobListingId: string;
  title: string;
  company: string;
  workSetup: string;
  status: string;
  appliedAt: string;
  logoText: string;
}

export interface StudentDashboardJobMatchDto {
  jobListingId: string;
  title: string;
  company: string;
  workSetup: string;
  jobType: string;
  matchScore: number;
  matchedSkills: string[];
}

export interface ResumeStrengthDto {
  score: number;
  hasWorkExperience: boolean;
  hasSkills: boolean;
  hasPortfolio: boolean;
  hasLatestResume: boolean;
}

export interface StudentDashboardDto {
  studentName: string;
  profilePictureUrl?: string | null;
  appliedCount: number;
  underReviewCount: number;
  shortlistedCount: number;
  interviewCount: number;
  newMatchesCount: number;
  newListingsTodayCount: number;
  awaitingUpdateCount: number;
  resumeStrength: ResumeStrengthDto;
  recentApplications: StudentDashboardApplicationDto[];
  topJobMatches: StudentDashboardJobMatchDto[];
}

export const studentDashboardService = {
  async getDashboard(): Promise<Result<StudentDashboardDto>> {
    try {
      const response = await apiClient.get<StudentDashboardDto>('/student/dashboard');
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load dashboard',
        statusCode: axiosError.response?.status
      };
    }
  }
};
