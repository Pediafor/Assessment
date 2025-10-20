"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { apiForgotPassword } from "@/lib/auth-api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null); setError(null); setPending(true);
    try {
      await apiForgotPassword(email);
      setMsg('If the email exists, a reset link has been sent.');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Request failed');
    } finally { setPending(false); }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Forgot password</h1>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} aria-busy={pending}>
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="min-h-5 text-xs" role="status" aria-live="polite">
              {error ? <span className="text-rose-600">{error}</span> : msg ? <span className="text-emerald-600">{msg}</span> : null}
            </div>
            <Button className="w-full" disabled={pending}>{pending ? 'Sending…' : 'Send reset link'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
