import apiClient from '../lib/apiClient';
import type { Result } from '../types';

export interface ConversationDto {
  userId: string;
  name: string;
  role: string;
  jobTitle: string;
  isRead: boolean;
  isOnline: boolean;
  lastSenderIsMe: boolean;
  lastMessage: string;
  lastMessageAt: string;
  applicationStage?: string;
  matchScore: number;
  applicantId?: string;
  appliedDate?: string;
  skills?: string[];
}

export interface MessageDto {
  id: string;
  senderId: string;
  content: string;
  sentAt: string;
  type: string;
  inviteDetails?: InterviewInviteDetailsDto;
}

export interface InterviewInviteDetailsDto {
  position: string;
  dateDisplay: string;
  timeDisplay: string;
  format: string;
}

export interface SendMessageCommand {
  receiverId: string;
  content: string;
}

export const messageService = {
  async getConversations(): Promise<Result<ConversationDto[]>> {
    try {
      const response = await apiClient.get<ConversationDto[]>('/messages/conversations');
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to load conversations',
        statusCode: error.response?.status
      };
    }
  },

  async getMessages(otherUserId: string): Promise<Result<MessageDto[]>> {
    try {
      const response = await apiClient.get<MessageDto[]>(`/messages/${otherUserId}`);
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to load messages',
        statusCode: error.response?.status
      };
    }
  },

  async sendMessage(command: SendMessageCommand): Promise<Result<MessageDto>> {
    try {
      const response = await apiClient.post<MessageDto>('/messages', command);
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to send message',
        statusCode: error.response?.status
      };
    }
  }
};
