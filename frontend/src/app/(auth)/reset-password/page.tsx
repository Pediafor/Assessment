"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { apiResetPassword } from "@/lib/auth-api";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null); setError(null);
    if (!token) { setError('Missing token'); return; }
    if (!password || password !== confirm) { setError('Passwords do not match'); return; }
    setPending(true);
    try {
      await apiResetPassword(token, password);
      setMsg('Password updated. You can now sign in.');
      setTimeout(() => router.push('/login' as any), 800);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Reset failed');
    } finally { setPending(false); }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Reset password</h1>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} aria-busy={pending}>
            <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            <div className="min-h-5 text-xs" role="status" aria-live="polite">
              {error ? <span className="text-rose-600">{error}</span> : msg ? <span className="text-emerald-600">{msg}</span> : null}
            </div>
            <Button className="w-full" disabled={pending}>{pending ? 'Updating…' : 'Update password'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
