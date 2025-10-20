"use client";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
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

// --- Infinite pagination variant ---
type NotificationsResponseShape =
  | NotificationItem[]
  | {
      success?: boolean;
      data?: { notifications?: NotificationItem[]; nextCursor?: string } | NotificationItem[];
      notifications?: NotificationItem[];
      nextCursor?: string;
    };

function normalizeNotifications(res: any): { items: NotificationItem[]; nextCursor?: string } {
  const root = res?.data ?? res;
  // Direct array
  if (Array.isArray(root)) return { items: root as NotificationItem[] };
  // { data: { notifications, nextCursor } }
  if (root?.data && typeof root.data === 'object') {
    const d = root.data as any;
    if (Array.isArray(d)) return { items: d as NotificationItem[] };
    if (Array.isArray(d.notifications)) return { items: d.notifications as NotificationItem[], nextCursor: d.nextCursor };
  }
  // { notifications, nextCursor }
  if (Array.isArray(root?.notifications)) return { items: root.notifications as NotificationItem[], nextCursor: root.nextCursor };
  return { items: [] };
}

export function useNotificationsInfinite(params?: { limit?: number }) {
  const limit = params?.limit ?? 50;
  return useInfiniteQuery({
    queryKey: ['notifications', 'infinite', limit],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res: NotificationsResponseShape = await NotificationsApi.listMine({ limit, after: pageParam });
      return normalizeNotifications(res);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30_000,
  });
}
