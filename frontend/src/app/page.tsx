"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { Route } from "next";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const router = useRouter();
  const { role, dashboardPath } = useAuth();
  useEffect(() => {
    if (role) router.replace(dashboardPath as any);
  }, [role, dashboardPath, router]);
  return (
    <div className="grid place-items-center py-16">
      <Card className="max-w-2xl">
        <CardContent>
          <h1 className="text-3xl font-semibold">Pediafor Assessment Platform</h1>
          <p className="mt-2 text-muted">
            Choose a role to explore dashboards, or sign in to continue.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={("/student" as Route)}><Button variant="secondary">Student</Button></Link>
            <Link href={("/teacher" as Route)}><Button variant="secondary">Teacher</Button></Link>
            <Link href={("/admin" as Route)}><Button variant="secondary">Admin</Button></Link>
            <Link href={("/login" as Route)}><Button>Sign in</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
