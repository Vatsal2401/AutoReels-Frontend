import apiClient from './client';

export interface UserNotification {
  id: string;
  type: 'video_completed' | 'video_failed';
  title: string;
  message: string;
  video_id: string | null;
  action_href: string | null;
  read: boolean;
  created_at: string;
}

export const userNotificationsApi = {
  list: async (): Promise<UserNotification[]> => {
    const res = await apiClient.get<UserNotification[]>('/user-notifications');
    return res.data;
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/user-notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch('/user-notifications/read-all');
  },
};
