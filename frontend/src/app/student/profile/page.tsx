"use client";
import { useEffect, useState } from "react";
import { RoleGuard } from "@/components/role-guard";
import { useChangePassword, useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StudentProfilePage() {
  const { data: me } = useProfile();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile() as any;
  const { mutateAsync: changePassword, isPending: changing } = useChangePassword() as any;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | { type: "success" | "error"; msg: string }>(null);

  useEffect(() => {
    if (me) {
      setName((me as any)?.name || "");
      setEmail((me as any)?.email || "");
    }
  }, [me]);

  return (
    <RoleGuard allow="student">
      <main role="main" aria-label="Student profile" className="max-w-2xl space-y-6">
        <h2 className="text-xl font-semibold">Profile</h2>
        {status ? (
          <div
            role="status"
            className={
              "rounded-md border p-2 text-sm " +
              (status.type === "success"
                ? "border-green-300 bg-green-50 text-green-800"
                : "border-red-300 bg-red-50 text-red-800")
            }
          >
            {status.msg}
          </div>
        ) : null}

        <Card>
          <CardHeader className="text-base font-medium">Account information</CardHeader>
          <CardContent className="grid gap-4">
            <label className="block text-sm">
              <span className="mb-1 block">Name</span>
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block">Email</span>
              <Input
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                disabled={isPending}
                onClick={async () => {
                  setStatus(null);
                  try {
                    await updateProfile({ name: name || undefined, email: email || undefined });
                    setStatus({ type: "success", msg: "Profile updated" });
                  } catch (e) {
                    setStatus({ type: "error", msg: "Failed to update profile. Please try again." });
                  }
                }}
              >
                {isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-base font-medium">Change password</CardHeader>
          <CardContent className="grid gap-3 max-w-md">
            <Input id="pwd-current" type="password" placeholder="Current password" />
            <Input id="pwd-new" type="password" placeholder="New password" />
            <Input id="pwd-confirm" type="password" placeholder="Confirm new password" />
            <div className="pt-1">
              <Button
                variant="secondary"
                size="md"
                disabled={changing}
                onClick={async () => {
                  setStatus(null);
                  const current = (document.getElementById('pwd-current') as HTMLInputElement)?.value || '';
                  const next = (document.getElementById('pwd-new') as HTMLInputElement)?.value || '';
                  const confirm = (document.getElementById('pwd-confirm') as HTMLInputElement)?.value || '';
                  if (!next) {
                    setStatus({ type: 'error', msg: 'New password is required' });
                    return;
                  }
                  if (next !== confirm) {
                    setStatus({ type: 'error', msg: 'Passwords do not match' });
                    return;
                  }
                  try {
                    await changePassword({ currentPassword: current, newPassword: next });
                    setStatus({ type: 'success', msg: 'Password updated' });
                  } catch {
                    setStatus({ type: 'error', msg: 'Failed to update password' });
                  }
                }}
              >
                {changing ? "Updating…" : "Update password"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </RoleGuard>
  );
}
