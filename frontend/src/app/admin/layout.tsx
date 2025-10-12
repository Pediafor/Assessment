"use client";
import { Sidebar } from "@/components/layout/sidebar";
import type { Route } from "next";
import { RoleGuard } from "@/components/role-guard";
import { LayoutDashboard, Users, Settings, ShieldCheck, BarChart3 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const items = [
    { label: "Dashboard", href: "/admin" as Route, icon: LayoutDashboard, exact: true },
    { label: "Users", href: "/admin/users" as Route, icon: Users },
    { label: "Settings", href: "/admin/settings" as Route, icon: Settings },
    { label: "Audit", href: "/admin/audit" as Route, icon: ShieldCheck },
    { label: "Reports", href: "/admin/reports" as Route, icon: BarChart3 },
  ];
  return (
    <RoleGuard allow="admin">
      <div className="min-h-[60vh] lg:grid lg:grid-cols-[220px_1fr] gap-6">
        <Sidebar items={items} />
        <section>
          <h1 className="text-2xl font-semibold mb-4">Admin</h1>
          {children}
        </section>
      </div>
    </RoleGuard>
  );
}
