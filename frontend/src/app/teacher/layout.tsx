"use client";
import { Sidebar } from "@/components/layout/sidebar";
import type { Route } from "next";
import { RoleGuard } from "@/components/role-guard";
import { LayoutDashboard, BookOpen, Users, ClipboardList, BarChart3 } from "lucide-react";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const items = [
    { label: "Dashboard", href: "/teacher" as Route, icon: LayoutDashboard, exact: true },
    { label: "Assessments", href: "/teacher/assessments" as Route, icon: BookOpen },
    { label: "Grading", href: "/teacher/grading" as Route, icon: ClipboardList },
    { label: "Students", href: "/teacher/students" as Route, icon: Users },
    { label: "Reports", href: "/teacher/reports" as Route, icon: BarChart3 },
  ];
  return (
    <RoleGuard allow="teacher">
      <div className="min-h-[60vh] lg:grid lg:grid-cols-[220px_1fr] gap-6">
        <Sidebar items={items} />
        <section>
          <h1 className="text-2xl font-semibold mb-4">Teacher</h1>
          {children}
        </section>
      </div>
    </RoleGuard>
  );
}
