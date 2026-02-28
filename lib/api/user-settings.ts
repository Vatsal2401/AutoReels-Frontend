import { apiClient } from './client';

export interface UserSettingsResponse {
  social_media_scheduler_enabled: boolean;
}

export async function getUserSettings(): Promise<UserSettingsResponse> {
  const res = await apiClient.get<UserSettingsResponse>('/user-settings');
  return res.data;
}
