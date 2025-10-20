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
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const { login, dashboardPath, role } = useAuth();

  useEffect(() => {
    if (role) router.replace(dashboardPath as any);
  }, [role, dashboardPath, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setPending(true);
    try {
      await login(email, password);
      router.push(dashboardPath as any);
    } catch (err: any) {
      const msg: string = err?.message || "Login failed";
      setError(msg);
      if (/email/i.test(msg) && /password/i.test(msg)) {
        setFieldErrors({ email: 'Check your email', password: 'Check your password' });
      } else if (/email/i.test(msg)) {
        setFieldErrors({ email: msg });
      } else if (/password/i.test(msg)) {
        setFieldErrors({ password: msg });
      }
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
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500" role="alert">{fieldErrors.email}</p>
              )}
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
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-500" role="alert">{fieldErrors.password}</p>
              )}
            </div>
            <p role="status" aria-live="polite" className="min-h-5 text-sm">
              {error ? <span className="text-red-500">{error}</span> : null}
            </p>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
