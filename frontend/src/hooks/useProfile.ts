"use client";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UsersApi } from '@/lib/api';

export type Profile = { id: string; name?: string; email?: string; role?: string };

export function useProfile() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await UsersApi.me();
      const data = res?.data ?? res;
      return data as Profile;
    },
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name?: string; email?: string }) => UsersApi.updateProfile(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) => UsersApi.changePassword(payload),
  });
}
