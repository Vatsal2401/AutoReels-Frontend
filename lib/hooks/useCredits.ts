'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creditsApi } from '@/lib/api/credits';
import { useAuth } from './useAuth';

export function useCredits() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: creditInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['credits'],
    queryFn: creditsApi.getCreditInfo,
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
  });

  const purchaseMutation = useMutation({
    mutationFn: creditsApi.purchaseCredits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
  });

  return {
    credits: creditInfo?.balance ?? null,
    isPaid: creditInfo?.is_premium ?? false,
    isLoading,
    error,
    hasCredits: (creditInfo?.balance ?? 0) > 0,
    purchaseCredits: purchaseMutation.mutate,
    isPurchasing: purchaseMutation.isPending,
  };
}
