"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChangePassword, useProfile, useUpdateProfile } from "@/hooks/useProfile";

export default function StudentProfile() {
  const { data: me } = useProfile();
  const { mutateAsync: updateProfile, isPending: saving, isError: saveErr, error: saveError } = useUpdateProfile() as any;
  const { mutateAsync: changePassword, isPending: changing, isError: pwdErr, error: pwdError } = useChangePassword() as any;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (me) {
      setName(me.name || "");
      setEmail(me.email || "");
    }
  }, [me]);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email }).catch(() => {});
  };

  const onChangePassword = async () => {
    const current = (document.getElementById('pwd-current') as HTMLInputElement)?.value || '';
    const next = (document.getElementById('pwd-new') as HTMLInputElement)?.value || '';
    const confirm = (document.getElementById('pwd-confirm') as HTMLInputElement)?.value || '';
    if (!next || next !== confirm) return;
    await changePassword({ currentPassword: current, newPassword: next }).catch(() => {});
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
          {saveErr ? <span className="text-xs text-rose-600" role="alert">{(saveError as any)?.message || 'Failed to save'}</span> : null}
        </div>
      </form>
      <div>
        <h3 className="text-lg font-semibold mb-2">Change Password</h3>
        <div className="space-y-3">
          <Input id="pwd-current" type="password" placeholder="Current password" />
          <Input id="pwd-new" type="password" placeholder="New password" />
          <Input id="pwd-confirm" type="password" placeholder="Confirm new password" />
          <div className="flex items-center gap-2">
            <Button variant="secondary" type="button" disabled={changing} onClick={onChangePassword}>{changing ? 'Updating…' : 'Update password'}</Button>
            {pwdErr ? <span className="text-xs text-rose-600" role="alert">{(pwdError as any)?.message || 'Failed to update password'}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
