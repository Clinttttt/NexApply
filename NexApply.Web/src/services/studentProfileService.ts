import apiClient from '../lib/apiClient';
import type { Result } from '../types';

export interface StudentProfileDto {
  fullName: string;
  phone?: string;
  location?: string;
  university?: string;
  course?: string;
  graduationYear?: number;
  linkedIn?: string;
  gitHub?: string;
  portfolio?: string;
  resumeFilePath?: string;
}

export interface UpdateStudentProfileCommand {
  fullName: string;
  phone?: string;
  location?: string;
  university?: string;
  course?: string;
  graduationYear?: number;
  linkedIn?: string;
  gitHub?: string;
  portfolio?: string;
}

export interface UploadResumeCommand {
  fileName: string;
  contentType: string;
  fileData: number[];
}

export interface ResumeUploadDto {
  filePath: string;
  parsedText: string;
}

export interface EducationDto {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startYear?: number;
  endYear?: number;
  description?: string;
}

export interface WorkExperienceDto {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface ResumeContentDto {
  fullName?: string;
  phone?: string;
  email?: string;
  location?: string;
  headline?: string;
  aboutMe?: string;
  education: EducationDto[];
  workExperience: WorkExperienceDto[];
  skills: string[];
}

export interface UpdateResumeCommand {
  headline?: string;
  aboutMe?: string;
  educationJson: string;
  workExperienceJson: string;
  skillsJson: string;
}

export const studentProfileService = {
  async getProfile(): Promise<Result<StudentProfileDto>> {
    try {
      const response = await apiClient.get<StudentProfileDto>('/profile/student');
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to load profile',
        statusCode: error.response?.status
      };
    }
  },

  async updateProfile(command: UpdateStudentProfileCommand): Promise<Result<StudentProfileDto>> {
    try {
      const response = await apiClient.put<StudentProfileDto>('/profile/student', command);
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to update profile',
        statusCode: error.response?.status
      };
    }
  },

  async uploadResume(file: File): Promise<Result<ResumeUploadDto>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ResumeUploadDto>('/profile/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to upload resume',
        statusCode: error.response?.status
      };
    }
  },

  async getUploadedResumeFile(): Promise<Result<Blob>> {
    try {
      const response = await apiClient.get<Blob>('/profile/resume/uploaded-file', {
        responseType: 'blob'
      });
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to load uploaded resume',
        statusCode: error.response?.status
      };
    }
  },

  async getResumeContent(): Promise<Result<ResumeContentDto>> {
    try {
      const response = await apiClient.get<ResumeContentDto>('/profile/resume/content');
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to load resume content',
        statusCode: error.response?.status
      };
    }
  },

  async updateResume(command: UpdateResumeCommand): Promise<Result<ResumeContentDto>> {
    try {
      const response = await apiClient.put<ResumeContentDto>('/profile/resume', command);
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to update resume',
        statusCode: error.response?.status
      };
    }
  }
};
