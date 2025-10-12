"use client";
import Link from "next/link";
import type { Route } from "next";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";

export function Header() {
  const [open, setOpen] = useState(false);
  const { role, logout } = useAuth();
  const pathname = usePathname();

  // Hide header during assessment taking for distraction-free mode
  if (pathname?.startsWith("/student/assessment/")) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-md border"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <Link href="/" className="font-semibold">Pediafor</Link>
          {/* Desktop nav shows role links only when logged in */}
          <nav className="hidden lg:flex items-center gap-4 text-sm text-muted">
            {role && (
              <>
                <Link href={("/" + role) as unknown as Route}>Dashboard</Link>
                {role === "student" && <Link href={("/student/assessments" as Route)}>Assessments</Link>}
                {role === "teacher" && <Link href={("/teacher/assessments" as Route)}>Assessments</Link>}
                {role === "admin" && <Link href={("/admin/users" as Route)}>Users</Link>}
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {role ? (
            <button className="text-sm text-muted hover:underline" onClick={logout}>Logout</button>
          ) : (
            <Link href={("/login" as Route)} className="text-sm text-muted hover:underline">Login</Link>
          )}
          <ThemeToggle />
        </div>
      </div>
      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden border-t">
          <div className="container py-3 flex flex-col gap-2 text-sm">
            {!role && (
              <>
                <Link href={("/login" as Route)} onClick={() => setOpen(false)}>Login</Link>
                <Link href={("/register" as Route)} onClick={() => setOpen(false)}>Register</Link>
              </>
            )}
            {role && (
              <>
                <Link href={("/" + role) as unknown as Route} onClick={() => setOpen(false)}>Dashboard</Link>
                {role === "student" && <Link href={("/student/assessments" as Route)} onClick={() => setOpen(false)}>Assessments</Link>}
                {role === "teacher" && <Link href={("/teacher/assessments" as Route)} onClick={() => setOpen(false)}>Assessments</Link>}
                {role === "admin" && <Link href={("/admin/users" as Route)} onClick={() => setOpen(false)}>Users</Link>}
                <button className="text-left" onClick={() => { logout(); setOpen(false); }}>Logout</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
