import apiClient from '../lib/apiClient';
import type { Result } from '../types';

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
    } catch (error: any) {
      // Log full error details to console
      console.error('Job Listing Creation Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        request: error.config?.data
      });

      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.title || 'Failed to create job listing',
        statusCode: error.response?.status,
        validationErrors: error.response?.data?.validationErrors || error.response?.data?.errors
      };
    }
  },

  async getJobListings(): Promise<Result<JobListingDto[]>> {
    try {
      const response = await apiClient.get<JobListingDto[]>('/jobs');
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || 'Failed to load job listings',
        statusCode: error.response?.status
      };
    }
  },

  async getJobListing(id: string): Promise<Result<JobListingDto>> {
    try {
      const response = await apiClient.get<JobListingDto>(`/jobs/${id}`);
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || 'Failed to load job listing',
        statusCode: error.response?.status
      };
    }
  },

  async getJobListingDetails(id: string): Promise<Result<JobListingDetailsDto>> {
    try {
      const response = await apiClient.get<JobListingDetailsDto>(`/job-listings/${id}/details`);
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || 'Failed to load job listing details',
        statusCode: error.response?.status
      };
    }
  },

  async updateJobListing(id: string, command: UpdateJobListingCommand): Promise<Result<JobListingDto>> {
    try {
      const response = await apiClient.put<JobListingDto>(`/jobs/${id}`, command);
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.message || 'Failed to update job listing',
        statusCode: error.response?.status,
        validationErrors: error.response?.data?.error
      };
    }
  },

  async updateJobListingStatus(id: string, status: number): Promise<Result<boolean>> {
    try {
      const response = await apiClient.patch<boolean>(`/jobs/${id}/status`, { status });
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.message || 'Failed to update job status',
        statusCode: error.response?.status
      };
    }
  },

  async getCompanyJobListings(): Promise<Result<JobListingSummaryDto[]>> {
    try {
      const response = await apiClient.get<JobListingSummaryDto[]>('/jobs/company');
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || 'Failed to load job listings',
        statusCode: error.response?.status
      };
    }
  },

  async getStudentBrowseJobs(): Promise<Result<StudentBrowseJobDto[]>> {
    try {
      const response = await apiClient.get<StudentBrowseJobDto[]>('/jobs/browse');
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to load matched jobs',
        statusCode: error.response?.status
      };
    }
  }
};
