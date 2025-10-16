"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const { login, dashboardPath, role } = useAuth();

  useEffect(() => {
    if (role) router.replace(dashboardPath as any);
  }, [role, dashboardPath, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password);
      router.push(dashboardPath as any);
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Sign in</h1>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} aria-busy={pending}>
            <div>
              <label className="block text-sm mb-1" htmlFor="login-email">Email</label>
              <Input
                id="login-email"
                type="email"
                placeholder="admin@pediafor.com | teacher@pediafor.com | student@pediafor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="login-password">Password</label>
              <Input
                id="login-password"
                type="password"
                placeholder="Any value for now"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <p role="status" aria-live="polite" className="min-h-5 text-sm">
              {error ? <span className="text-red-500">{error}</span> : null}
            </p>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
