'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userNotificationsApi, UserNotification } from '@/lib/api/user-notifications';
import { useAuth } from '@/lib/hooks/useAuth';

interface NotificationsContextType {
  notifications: UserNotification[];
  unreadCount: number;
  isLoading: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  refetch: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ['user-notifications'],
    queryFn: userNotificationsApi.list,
    enabled: isAuthenticated,
    // Only refetch on window focus — no polling interval
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const markReadMutation = useMutation({
    mutationFn: userNotificationsApi.markRead,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['user-notifications'] });
      const prev = queryClient.getQueryData<UserNotification[]>(['user-notifications']);
      queryClient.setQueryData<UserNotification[]>(['user-notifications'], (old = []) =>
        old.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['user-notifications'], ctx.prev);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: userNotificationsApi.markAllRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['user-notifications'] });
      const prev = queryClient.getQueryData<UserNotification[]>(['user-notifications']);
      queryClient.setQueryData<UserNotification[]>(['user-notifications'], (old = []) =>
        old.map((n) => ({ ...n, read: true })),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['user-notifications'], ctx.prev);
    },
  });

  const unreadCount = useMemo(() => data.filter((n) => !n.read).length, [data]);

  const { mutate: mutateRead } = markReadMutation;
  const { mutate: mutateAllRead } = markAllReadMutation;

  const value = useMemo<NotificationsContextType>(
    () => ({
      notifications: data,
      unreadCount,
      isLoading,
      markRead: (id) => mutateRead(id),
      markAllRead: () => mutateAllRead(),
      refetch,
    }),
    [data, unreadCount, isLoading, refetch, mutateRead, mutateAllRead],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextType {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
}
