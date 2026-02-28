import apiClient from './client';

export type SocialPlatform = 'youtube' | 'tiktok' | 'instagram';
export type PostStatus = 'pending' | 'uploading' | 'success' | 'failed' | 'cancelled';

export interface ConnectedAccount {
  id: string;
  platform: SocialPlatform;
  platformAccountId: string;
  accountName: string | null;
  accountAvatarUrl: string | null;
  isActive: boolean;
  needsReauth: boolean;
  tokenExpiresAt: string | null;
  connectedAt: string;
}

export interface ScheduledPost {
  id: string;
  platform: SocialPlatform;
  status: PostStatus;
  video_topic: string | null;
  scheduled_at: string;
  platform_post_id: string | null;
  upload_progress_pct: number;
  error_message: string | null;
  created_at: string;
  connected_account_id: string;
}

export interface SchedulePostDto {
  platform: SocialPlatform;
  connectedAccountId: string;
  videoS3Key: string;
  videoTopic?: string;
  scheduledAt: string;
  publishOptions?: Record<string, any>;
}

export const socialApi = {
  // Accounts
  getConnectUrl: async (platform: SocialPlatform): Promise<string> => {
    const res = await apiClient.get<{ url: string }>(`/social/connect/${platform}/url`);
    return res.data.url;
  },

  listAccounts: async (): Promise<ConnectedAccount[]> => {
    const res = await apiClient.get<ConnectedAccount[]>('/social/accounts');
    return res.data;
  },

  disconnectAccount: async (accountId: string): Promise<void> => {
    await apiClient.delete(`/social/accounts/${accountId}`);
  },

  // Posts
  schedulePost: async (dto: SchedulePostDto): Promise<ScheduledPost> => {
    const res = await apiClient.post<ScheduledPost>('/social/posts', dto);
    return res.data;
  },

  listPosts: async (status?: PostStatus): Promise<ScheduledPost[]> => {
    const params = status ? { status } : {};
    const res = await apiClient.get<ScheduledPost[]>('/social/posts', { params });
    return res.data;
  },

  getPost: async (postId: string): Promise<ScheduledPost> => {
    const res = await apiClient.get<ScheduledPost>(`/social/posts/${postId}`);
    return res.data;
  },

  cancelPost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/social/posts/${postId}`);
  },
};
