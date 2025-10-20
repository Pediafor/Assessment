"use client";
import { Sidebar } from "@/components/layout/sidebar";
import type { Route } from "next";
import { RoleGuard } from "@/components/role-guard";
import { LayoutDashboard, BookOpen, GraduationCap, Users, BarChart3 } from "lucide-react";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const items = [
    { label: "Dashboard", href: "/teacher" as Route, icon: LayoutDashboard, exact: true },
    { label: "Assessments", href: "/teacher/assessments" as Route, icon: BookOpen },
    { label: "Grading", href: "/teacher/grading" as Route, icon: GraduationCap },
    { label: "Students", href: "/teacher/students" as Route, icon: Users },
    { label: "Reports", href: "/teacher/reports" as Route, icon: BarChart3 },
  ];
  return (
    <RoleGuard allow="teacher">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-black text-white dark:bg-white dark:text-black rounded px-2 py-1">Skip to content</a>
      <div className="min-h-[60vh] lg:grid lg:grid-cols-[220px_1fr] gap-6">
        <Sidebar items={items} />
        <section id="main">
          <h1 className="text-2xl font-semibold mb-4">Teacher</h1>
          {children}
        </section>
      </div>
    </RoleGuard>
  );
}
