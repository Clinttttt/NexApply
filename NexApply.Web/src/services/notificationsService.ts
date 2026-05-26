import { AxiosError } from 'axios';
import apiClient from '../lib/apiClient';
import type { Result } from '../types';

export interface NotificationDto {
  id: string;
  category: string;
  title: string;
  body: string;
  detailBody: string;
  createdAt: string; // ISO string
  isRead: boolean;
  actionLabel: string;
  primaryAction: string;
  secondaryAction: string;
  metaItems: Record<string, string>;
}

export const notificationsService = {
  async getNotifications(): Promise<Result<NotificationDto[]>> {
    try {
      const response = await apiClient.get<NotificationDto[]>('/notifications');
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to load notifications',
        statusCode: axiosError.response?.status
      };
    }
  },

  async markRead(notificationId: string): Promise<Result<boolean>> {
    try {
      const encoded = encodeURIComponent(notificationId);
      const response = await apiClient.post<boolean>(`/notifications/${encoded}/read`, {});
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to mark notification as read',
        statusCode: axiosError.response?.status
      };
    }
  },

  async markAllRead(): Promise<Result<boolean>> {
    try {
      const response = await apiClient.post<boolean>('/notifications/read-all', {});
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to mark all notifications as read',
        statusCode: axiosError.response?.status
      };
    }
  },

  async dismiss(notificationId: string): Promise<Result<boolean>> {
    try {
      const encoded = encodeURIComponent(notificationId);
      const response = await apiClient.delete<boolean>(`/notifications/${encoded}`);
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to dismiss notification',
        statusCode: axiosError.response?.status
      };
    }
  },

  async clearRead(): Promise<Result<boolean>> {
    try {
      const response = await apiClient.post<boolean>('/notifications/clear-read', {});
      return { isSuccess: true, value: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      return {
        isSuccess: false,
        error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to clear read notifications',
        statusCode: axiosError.response?.status
      };
    }
  }
};

