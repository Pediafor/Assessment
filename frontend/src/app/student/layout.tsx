"use client";
import { Sidebar } from "@/components/layout/sidebar";
import type { Route } from "next";
import { RoleGuard } from "@/components/role-guard";
import { LayoutDashboard, BookOpen, User, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAssessment = pathname?.startsWith("/student/assessment/") ?? false;
  const { data: notifs } = useNotifications({ limit: 50 });
  const unread = (notifs || []).filter((n: any) => !n.read).length;
  const items = [
    { label: "Dashboard", href: "/student" as Route, icon: LayoutDashboard, exact: true },
    { label: "Assessments", href: "/student/assessments" as Route, icon: BookOpen },
    { label: "Results", href: "/student/results" as Route, icon: BookOpen },
    { label: "Notifications", href: "/student/notifications" as Route, icon: Bell, badgeCount: unread },
    { label: "Profile", href: "/student/profile" as Route, icon: User },
  ];
  return (
    <RoleGuard allow="student">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-black text-white dark:bg-white dark:text-black rounded px-2 py-1">Skip to content</a>
      <div className="min-h-[60vh] lg:grid lg:grid-cols-[220px_1fr] gap-6">
        {!isAssessment && <Sidebar items={items} />}
        <section id="main" className={isAssessment ? "lg:col-span-2" : undefined}>
          {!isAssessment && <h1 className="text-2xl font-semibold mb-4">Student</h1>}
          {children}
        </section>
      </div>
    </RoleGuard>
  );
}
