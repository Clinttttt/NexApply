import type { AxiosError } from 'axios';
import apiClient from './apiClient';
import type { Result } from '@/shared/types/index';

export interface RecentApplicantDto {
  applicationId: string;
  studentName: string;
  jobTitle: string;
  status: string;
  appliedAt: string;
}

export interface ActiveListingDto {
  jobListingId: string;
  title: string;
  jobType: string;
  workSetup: string;
  applicantCount: number;
  postedAt: string;
}

export interface CompanyDashboardDto {
  companyName: string;
  hiringManagerTitle?: string | null;
  companyLogoUrl?: string | null;
  awaitingReview: number;
  totalApplicants: number;
  upcomingInterviews: number;
  unreadMessages: number;
  activeJobsCount: number;
  recentApplicants: RecentApplicantDto[];
  activeListings: ActiveListingDto[];
}

export const companyDashboardService = {
  async getDashboard(): Promise<Result<CompanyDashboardDto>> {
    try {
      const response = await apiClient.get<CompanyDashboardDto>('/company/dashboard');
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
