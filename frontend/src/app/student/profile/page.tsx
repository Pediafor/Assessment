"use client";
import { useEffect, useState } from "react";
import { UsersApi } from "@/lib/api";
import { RoleGuard } from "@/components/role-guard";
import { useChangePassword, useProfile, useUpdateProfile } from "@/hooks/useProfile";

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
      <main role="main" aria-label="Student profile" className="max-w-xl space-y-4">
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
        <label className="block text-sm">
          <span className="mb-1 block">Name</span>
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">Email</span>
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <div className="pt-2">
          <button
            className="rounded-md border px-3 py-2 text-sm hover:bg-card disabled:opacity-50"
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
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
        <div className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Change Password</h3>
          <div className="grid gap-2 max-w-md">
            <input id="pwd-current" className="rounded-md border px-3 py-2" type="password" placeholder="Current password" />
            <input id="pwd-new" className="rounded-md border px-3 py-2" type="password" placeholder="New password" />
            <input id="pwd-confirm" className="rounded-md border px-3 py-2" type="password" placeholder="Confirm new password" />
            <div>
              <button
                className="rounded-md border px-3 py-2 text-sm hover:bg-card disabled:opacity-50"
                disabled={changing}
                onClick={async () => {
                  setStatus(null);
                  const current = (document.getElementById('pwd-current') as HTMLInputElement)?.value || '';
                  const next = (document.getElementById('pwd-new') as HTMLInputElement)?.value || '';
                  const confirm = (document.getElementById('pwd-confirm') as HTMLInputElement)?.value || '';
                  if (!next || next !== confirm) {
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
                {changing ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </RoleGuard>
  );
}
