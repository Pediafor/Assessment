"use client";
export type { UserRole } from "@/components/auth-provider";
import { useAuthContext } from "@/components/auth-provider";

export function useAuth() {
  return useAuthContext();
}
