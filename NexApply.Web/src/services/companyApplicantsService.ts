import type { AxiosError } from 'axios';
import apiClient from '../lib/apiClient';
import type { Result } from '../types';
import type { ResumeContentDto } from './studentProfileService';

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

export interface ResumeFileDto {
  blob: Blob;
  fileName?: string;
  contentType?: string;
}

function parseFileNameFromContentDisposition(contentDisposition?: string): string | undefined {
  if (!contentDisposition) return undefined;

  // Examples:
  // - attachment; filename="resume.pdf"
  // - attachment; filename*=UTF-8''resume%20(1).pdf
  const utf8Match = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const asciiMatch = /filename\s*=\s*"([^"]+)"/i.exec(contentDisposition) ?? /filename\s*=\s*([^;]+)/i.exec(contentDisposition);
  if (asciiMatch?.[1]) return asciiMatch[1].trim();

  return undefined;
}

export const companyApplicantsService = {
  async getApplicant(applicationId: string): Promise<Result<ApplicantDto>> {
    try {
      const response = await apiClient.get<ApplicantDto>(`/company/applicants/${applicationId}`);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load applicant',
        statusCode: axiosError.response?.status
      };
    }
  },

  async getApplicants(query?: GetCompanyApplicantsQuery): Promise<Result<ApplicantDto[]>> {
    try {
      const params = new URLSearchParams();
      if (query?.status) params.append('status', query.status);
      if (query?.jobListingId) params.append('jobListingId', query.jobListingId);
      if (query?.searchTerm) params.append('searchTerm', query.searchTerm);
      if (query?.sortBy) params.append('sortBy', query.sortBy);

      const response = await apiClient.get<ApplicantDto[]>(`/company/applicants?${params.toString()}`);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load applicants',
        statusCode: axiosError.response?.status
      };
    }
  },

  async updateApplicationStatus(applicationId: string, status: string): Promise<Result<boolean>> {
    try {
      const response = await apiClient.patch<boolean>(`/company/applicants/${applicationId}/status`, { status });
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to update application status',
        statusCode: axiosError.response?.status
      };
    }
  },

  async updateApplicationNotes(applicationId: string, notes: string): Promise<Result<boolean>> {
    try {
      const response = await apiClient.patch<boolean>(`/company/applicants/${applicationId}/notes`, { recruiterNotes: notes });
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to update application notes',
        statusCode: axiosError.response?.status
      };
    }
  },

  async getApplicantUploadedResumeFile(applicationId: string): Promise<Result<ResumeFileDto>> {
    try {
      const response = await apiClient.get<Blob>(`/company/applicants/${applicationId}/resume/uploaded-file`, {
        responseType: 'blob'
      });

      const rawContentType = response.headers?.['content-type'];
      const rawContentDisposition = response.headers?.['content-disposition'];

      const contentType = typeof rawContentType === 'string' ? rawContentType : undefined;
      const contentDisposition = typeof rawContentDisposition === 'string' ? rawContentDisposition : undefined;
      const fileName = parseFileNameFromContentDisposition(contentDisposition);

      return { isSuccess: true, value: { blob: response.data, fileName, contentType } };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'No uploaded resume found',
        statusCode: axiosError.response?.status
      };
    }
  },

  async getApplicantResumeContent(applicationId: string): Promise<Result<ResumeContentDto>> {
    try {
      const response = await apiClient.get<ResumeContentDto>(`/company/applicants/${applicationId}/resume/content`);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load profile resume',
        statusCode: axiosError.response?.status
      };
    }
  }
};
