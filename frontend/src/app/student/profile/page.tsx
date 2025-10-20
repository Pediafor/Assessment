"use client";
import { useState } from "react";
import { UsersApi } from "@/lib/api";
import { RoleGuard } from "@/components/role-guard";

export default function StudentProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | { type: "success" | "error"; msg: string }>(null);
  const [busy, setBusy] = useState(false);

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
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setStatus(null);
              try {
                await UsersApi.updateProfile({ name: name || undefined, email: email || undefined });
                setStatus({ type: "success", msg: "Profile updated" });
              } catch (e) {
                setStatus({ type: "error", msg: "Failed to update profile. Please try again." });
              } finally {
                setBusy(false);
              }
            }}
          >
            Save changes
          </button>
        </div>
      </main>
    </RoleGuard>
  );
}
