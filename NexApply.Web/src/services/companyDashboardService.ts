import apiClient from '../lib/apiClient';
import type { Result } from '../types';

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
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || 'Failed to load dashboard',
        statusCode: error.response?.status
      };
    }
  }
};
