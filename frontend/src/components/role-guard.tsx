"use client";
import { useEffect } from "react";
import { useAuth, type UserRole } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";

export function RoleGuard({ allow, children }: { allow: UserRole; children: React.ReactNode }) {
  const { role, loading, dashboardPath } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!role) {
      router.replace("/login" as any);
      return;
    }
    if (role !== allow) {
      router.replace(dashboardPath as any);
    }
  }, [role, loading, dashboardPath, router]);

  // Optionally display nothing during redirect checks
  if (loading) return null;
  if (!role || role !== allow) return null;
  return <>{children}</>;
}
