import { useQuery } from '@tanstack/react-query';
import { getUserSettings } from '../api/user-settings';

export function useUserSettings() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-settings'],
    queryFn: getUserSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes — settings rarely change
    retry: 1,
  });

  return {
    socialSchedulerEnabled: data?.social_media_scheduler_enabled ?? false,
    isLoading,
    error,
  };
}
