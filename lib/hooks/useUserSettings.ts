import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserSettings } from '../api/user-settings';
import { ONBOARDING_COMPLETED_KEY } from './useOnboardingRedirect';

export function useUserSettings() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-settings'],
    queryFn: getUserSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes — settings rarely change
    retry: 1,
  });

  // Seed localStorage from DB (cross-browser sync on login)
  useEffect(() => {
    if (data?.has_completed_onboarding) {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    }
  }, [data?.has_completed_onboarding]);

  return {
    socialSchedulerEnabled: data?.social_media_scheduler_enabled ?? false,
    hasCompletedOnboarding: data?.has_completed_onboarding ?? false,
    isLoading,
    error,
  };
}
