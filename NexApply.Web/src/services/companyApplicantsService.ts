import apiClient from '../lib/apiClient';
import type { Result } from '../types';

export interface ApplicantDto {
  applicationId: string;
  studentId: string;
  studentName: string;
  email: string;
  phone?: string;
  location?: string;
  portfolio?: string;
  linkedIn?: string;
  gitHub?: string;
  resumeUrl?: string;
  jobListingId: string;
  jobTitle: string;
  jobType: string;
  status: string;
  matchScore?: number;
  appliedAt: string;
  coverLetter?: string;
  recruiterNotes?: string;
  skills: string[];
}

export interface GetCompanyApplicantsQuery {
  status?: string;
  jobListingId?: string;
  searchTerm?: string;
  sortBy?: string;
}

export const companyApplicantsService = {
  async getApplicants(query?: GetCompanyApplicantsQuery): Promise<Result<ApplicantDto[]>> {
    try {
      const params = new URLSearchParams();
      if (query?.status) params.append('status', query.status);
      if (query?.jobListingId) params.append('jobListingId', query.jobListingId);
      if (query?.searchTerm) params.append('searchTerm', query.searchTerm);
      if (query?.sortBy) params.append('sortBy', query.sortBy);

      const response = await apiClient.get<ApplicantDto[]>(`/company/applicants?${params.toString()}`);
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to load applicants',
        statusCode: error.response?.status
      };
    }
  },

  async updateApplicationStatus(applicationId: string, status: string): Promise<Result<boolean>> {
    try {
      const response = await apiClient.patch<boolean>(`/company/applicants/${applicationId}/status`, { status });
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to update application status',
        statusCode: error.response?.status
      };
    }
  },

  async updateApplicationNotes(applicationId: string, notes: string): Promise<Result<boolean>> {
    try {
      const response = await apiClient.patch<boolean>(`/company/applicants/${applicationId}/notes`, { recruiterNotes: notes });
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to update application notes',
        statusCode: error.response?.status
      };
    }
  }
};
