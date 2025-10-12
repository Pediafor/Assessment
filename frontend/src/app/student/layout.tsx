"use client";
import { Sidebar } from "@/components/layout/sidebar";
import type { Route } from "next";
import { RoleGuard } from "@/components/role-guard";
import { LayoutDashboard, BookOpen, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAssessment = pathname?.startsWith("/student/assessment/") ?? false;
  const items = [
    { label: "Dashboard", href: "/student" as Route, icon: LayoutDashboard, exact: true },
    { label: "Assessments", href: "/student/assessments" as Route, icon: BookOpen },
    { label: "Results", href: "/student/results" as Route, icon: BookOpen },
    { label: "Profile", href: "/student/profile" as Route, icon: User },
  ];
  return (
    <RoleGuard allow="student">
      <div className="min-h-[60vh] lg:grid lg:grid-cols-[220px_1fr] gap-6">
        {!isAssessment && <Sidebar items={items} />}
        <section className={isAssessment ? "lg:col-span-2" : undefined}>
          {!isAssessment && <h1 className="text-2xl font-semibold mb-4">Student</h1>}
          {children}
        </section>
      </div>
    </RoleGuard>
  );
}
