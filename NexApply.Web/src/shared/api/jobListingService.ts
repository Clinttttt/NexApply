import type { AxiosError } from 'axios';
import apiClient from './apiClient';
import type { Result } from '@/shared/types/index';

export interface JobListingDto {
  id: string;
  title: string;
  description: string;
  responsibilities: string;
  qualifications: string;
  requiredSkills: string;
  benefits?: string;
  location: string;
  jobType: string;
  workSetup: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  openings: number;
  deadline?: string;
  status: string;
  companyId: string;
  createdAt: string;
}

export interface JobListingDetailsDto {
  id: string;
  title: string;
  description: string;
  responsibilities: string;
  qualifications: string;
  requiredSkills: string;
  benefits?: string;
  location: string;
  jobType: string;
  workSetup: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  openings: number;
  deadline?: string;
  status: string;
  createdAt: string;
  companyName: string;
  companyLogoUrl?: string;
  totalApplicants: number;
  daysLeft: number;
  shortlistedCount: number;
  submittedCount: number;
  underReviewCount: number;
  forInterviewCount: number;
  declinedCount: number;
}

export interface UpdateJobListingCommand {
  title: string;
  description: string;
  responsibilities: string;
  qualifications: string;
  requiredSkills: string;
  benefits?: string;
  location: string;
  jobType: number;
  workSetup: number;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  openings: number;
  deadline?: string;
}

export interface JobListingSummaryDto {
  id: string;
  title: string;
  location: string;
  jobType: number;
  workSetup: number;
  status: number;
  totalApplicants: number;
  createdAt: string;
  deadline?: string;
  salaryMin?: number;
  salaryMax?: number;
  requiredSkills: string;
  description: string;
  submittedCount: number;
  underReviewCount: number;
  shortlistedCount: number;
  forInterviewCount: number;
}

export interface StudentBrowseJobDto {
  id: string;
  title: string;
  company: string;
  jobType: string;
  workSetup: string;
  location: string;
  matchScore: number;
  postedAt: string;
  applicants: number;
  salary: string;
  logoText: string;
  isSaved: boolean;
  hasApplied: boolean;
  matchedSkills: string[];
  missingSkills: string[];
  description: string[];
  responsibilities: string[];
  requirements: string[];
}

export interface JobBoardJobDto {
  id: string;
  company: string;
  role: string;
  type: string;
  setup: string;
  location: string;
  postedAt: string;
  applicants: number;
  salary: string;
  matchPercentage: number;
  skills: string[];
  about: string;
  responsibilities: string[];
  requirements: string[];
}

export interface CursorPagedResult<T> {
  items: T[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface CreateJobListingCommand {
  title: string;
  description: string;
  responsibilities: string;
  qualifications: string;
  requiredSkills: string;
  benefits?: string;
  location: string;
  jobType: number;
  workSetup: number;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  openings: number;
  deadline?: string;
}

export const jobListingService = {
  async createJobListing(command: CreateJobListingCommand): Promise<Result<JobListingDto>> {
    try {
      const response = await apiClient.post<JobListingDto>('/jobs', command);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{
        error?: string;
        message?: string;
        title?: string;
        validationErrors?: Record<string, string[]>;
        errors?: Record<string, string[]>;
      }>;

      console.error('Job Listing Creation Error:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        headers: axiosError.response?.headers,
        request: axiosError.config?.data
      });

      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.title || axiosError.response?.data?.message || 'Failed to create job listing',
        statusCode: axiosError.response?.status,
        validationErrors: axiosError.response?.data?.validationErrors || axiosError.response?.data?.errors
      };
    }
  },

  async getJobListings(): Promise<Result<JobListingDto[]>> {
    try {
      const response = await apiClient.get<JobListingDto[]>('/jobs');
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load job listings',
        statusCode: axiosError.response?.status
      };
    }
  },

  async getJobListing(id: string): Promise<Result<JobListingDto>> {
    try {
      const response = await apiClient.get<JobListingDto>(`/jobs/${id}`);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load job listing',
        statusCode: axiosError.response?.status
      };
    }
  },

  async getJobListingDetails(id: string): Promise<Result<JobListingDetailsDto>> {
    try {
      const response = await apiClient.get<JobListingDetailsDto>(`/jobs/${id}/details`);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load job listing details',
        statusCode: axiosError.response?.status
      };
    }
  },

  async updateJobListing(id: string, command: UpdateJobListingCommand): Promise<Result<JobListingDto>> {
    try {
      const response = await apiClient.put<JobListingDto>(`/jobs/${id}`, command);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to update job listing',
        statusCode: axiosError.response?.status,
        validationErrors: axiosError.response?.data?.error ? { error: [axiosError.response.data.error] } : undefined
      };
    }
  },

  async updateJobListingStatus(id: string, status: number): Promise<Result<boolean>> {
    try {
      const response = await apiClient.patch<boolean>(`/jobs/${id}/status`, { status });
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to update job status',
        statusCode: axiosError.response?.status
      };
    }
  },

  async deleteJobListing(id: string): Promise<Result<boolean>> {
    try {
      const response = await apiClient.delete<boolean>(`/jobs/${id}`);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to delete job listing',
        statusCode: axiosError.response?.status
      };
    }
  },

  async getCompanyJobListings(): Promise<Result<JobListingSummaryDto[]>> {
    try {
      const response = await apiClient.get<JobListingSummaryDto[]>('/jobs/company');
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load job listings',
        statusCode: axiosError.response?.status
      };
    }
  },

  async getStudentBrowseJobs(params?: { cursor?: string | null; pageSize?: number }): Promise<Result<CursorPagedResult<StudentBrowseJobDto>>> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.cursor) searchParams.append('cursor', params.cursor);
      if (params?.pageSize) searchParams.append('pageSize', String(params.pageSize));

      const url = searchParams.toString()
        ? `/jobs/browse?${searchParams.toString()}`
        : '/jobs/browse';

      const response = await apiClient.get<CursorPagedResult<StudentBrowseJobDto>>(url);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load matched jobs',
        statusCode: axiosError.response?.status
      };
    }
  },

  async getJobBoardJobs(): Promise<Result<JobBoardJobDto[]>> {
    try {
      const response = await apiClient.get<JobBoardJobDto[]>('/jobs/board');
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load job board',
        statusCode: axiosError.response?.status
      };
    }
  }
};
