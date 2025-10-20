"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationsApi } from '@/lib/api';

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message?: string;
  createdAt: string;
  read?: boolean;
};

export function useNotifications(params?: { limit?: number }) {
  return useQuery({
    queryKey: ['notifications', params?.limit || 50],
    queryFn: async () => {
      const res = await NotificationsApi.listMine({ limit: params?.limit || 50 });
      const data = res?.data ?? res;
      // normalize common API shapes
      if (Array.isArray(data)) return data as NotificationItem[];
      if (Array.isArray(data?.notifications)) return data.notifications as NotificationItem[];
      if (Array.isArray(res?.data?.notifications)) return res.data.notifications as NotificationItem[];
      return [] as NotificationItem[];
    },
    staleTime: 30_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => NotificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
