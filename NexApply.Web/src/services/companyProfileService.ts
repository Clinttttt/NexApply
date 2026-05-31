import type { AxiosError } from 'axios';
import apiClient from '../lib/apiClient';
import type { Result } from '../types';

export interface CompanyProfileDto {
  id: string;
  companyName: string;
  tagline?: string;
  description?: string;
  mission?: string;
  website?: string;
  logoUrl?: string
  industry?: string;
  location?: string;
  companySize?: string;
  founded?: string;
  perksAndBenefits?: string;
  workCulture?: string;
  contactEmail?: string;
  contactPhone?: string;
  linkedInUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  gitHubUrl?: string;
  hiringManagerName?: string;
  hiringManagerTitle?: string;
  hiringManagerEmail?: string;
  activeListingsCount: number;
}

export interface UpdateCompanyProfileCommand {
  companyName: string;
  tagline?: string;
  description?: string;
  mission?: string;
  website?: string;
  logoUrl?: string;
  industry?: string;
  location?: string;
  companySize?: string;
  founded?: string;
  perksAndBenefits?: string;
  workCulture?: string;
  contactEmail?: string;
  contactPhone?: string;
  linkedInUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  gitHubUrl?: string;
  hiringManagerName?: string;
  hiringManagerTitle?: string;
  hiringManagerEmail?: string;
}

export const companyProfileService = {
  async getProfile(): Promise<Result<CompanyProfileDto>> {
    try {
      const response = await apiClient.get<CompanyProfileDto>('/company/profile');
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load profile',
        statusCode: axiosError.response?.status
      };
    }
  },

  async updateProfile(command: UpdateCompanyProfileCommand): Promise<Result<CompanyProfileDto>> {
    try {
      const response = await apiClient.put<CompanyProfileDto>('/company/profile', command);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to update profile',
        statusCode: axiosError.response?.status
      };
    }
  }
};
