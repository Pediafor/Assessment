"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { apiRegister } from "@/lib/auth-api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);
    try {
      await apiRegister({ name, email, password, role: 'STUDENT' });
      setSuccess('Account created. Please login.');
      setTimeout(() => router.push('/login' as any), 800);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Create account</h1>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} aria-busy={pending}>
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <div className="min-h-5 text-xs" role="status" aria-live="polite">
              {error ? <span className="text-rose-600">{error}</span> : success ? <span className="text-emerald-600">{success}</span> : null}
            </div>
            <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Creating…' : 'Sign up'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
