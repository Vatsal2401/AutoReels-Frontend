import apiClient from './client';

export interface UserSettingsResponse {
  social_media_scheduler_enabled: boolean;
  has_completed_onboarding: boolean;
}

export async function getUserSettings(): Promise<UserSettingsResponse> {
  const res = await apiClient.get<UserSettingsResponse>('/user-settings');
  return res.data;
}

export async function completeOnboarding(): Promise<void> {
  await apiClient.post('/user-settings/complete-onboarding');
}
