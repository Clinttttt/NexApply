import apiClient from '../lib/apiClient';
import type { Result } from '../types';

export interface PublicStatsDto {
  activeListings: number;
  companies: number;
  students: number;
}

export const publicStatsService = {
  async getStats(): Promise<Result<PublicStatsDto>> {
    try {
      const response = await apiClient.get('/public/stats');
      console.log('Raw stats API response:', response.data);
      
      // API returns the object directly (not wrapped in Result)
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      console.error('Stats API error:', error.response?.data || error.message);
      return {
        isSuccess: false,
        error: error.response?.data?.error || 'Failed to fetch stats'
      };
    }
  }
};
