import type { AxiosError } from 'axios';
import apiClient from '../lib/apiClient';
import type { Result } from '../types';

export interface TestimonialDto {
  studentName: string;
  role: string;
  testimonial: string;
}

export const testimonialService = {
  async getTestimonials(): Promise<Result<TestimonialDto[]>> {
    try {
      const response = await apiClient.get('/public/feedback');
      // API returns the array directly (not wrapped in Result)
      const data = Array.isArray(response.data) ? response.data : [];
      
      return { isSuccess: true, value: data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load testimonials',
        statusCode: axiosError.response?.status,
      };
    }
  },
};
