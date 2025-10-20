"use client";
import { useEffect, useState } from "react";
import { RoleGuard } from "@/components/role-guard";
import { useChangePassword, useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/toast";

export default function StudentProfilePage() {
  const { data: me } = useProfile();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile() as any;
  const { mutateAsync: changePassword, isPending: changing } = useChangePassword() as any;
  const { success, error } = useToast();
  const [ariaStatus, setAriaStatus] = useState<string>("");

  const profileSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(120, "Too long"),
    email: z.string().trim().email("Invalid email"),
  });
  type ProfileForm = z.infer<typeof profileSchema>;
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "" },
    mode: "onBlur",
  });

  const passwordSchema = z.object({
    current: z.string().optional(),
    next: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  }).refine((d: { next: string; confirm: string }) => d.next === d.confirm, { path: ["confirm"], message: "Passwords do not match" });
  type PasswordForm = z.infer<typeof passwordSchema>;
  const pwdForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema), defaultValues: { current: "", next: "", confirm: "" }, mode: "onBlur" });

  useEffect(() => {
    if (me) {
      profileForm.reset({ name: (me as any)?.name || "", email: (me as any)?.email || "" });
    }
  }, [me]);

  return (
    <RoleGuard allow="student">
      <main role="main" aria-label="Student profile" className="max-w-2xl space-y-6">
        <h2 className="text-xl font-semibold">Profile</h2>
        {/* A11y status region for tests and screen readers */}
        {ariaStatus ? (
          <div role="status" aria-live="polite" className="sr-only">{ariaStatus}</div>
        ) : null}
        <Card>
          <CardHeader className="text-base font-medium">Account information</CardHeader>
          <CardContent className="grid gap-4">
            <form
              className="grid gap-4"
              onSubmit={profileForm.handleSubmit(async (vals) => {
                try {
                  await updateProfile({ name: vals.name, email: vals.email });
                  success("Profile updated");
                  setAriaStatus("Profile updated");
                } catch {
                  error("Failed to update profile. Please try again.");
                  setAriaStatus("Failed to update profile");
                }
              }, () => {
                // Invalid form submission
                setAriaStatus("Failed to update profile");
              })}
            >
              <label className="block text-sm">
                <span className="mb-1 block">Name</span>
                <Input placeholder="Your name" {...profileForm.register("name")} />
                {profileForm.formState.errors.name ? (
                  <div className="text-xs text-red-600 mt-1">{profileForm.formState.errors.name.message}</div>
                ) : null}
              </label>
              <label className="block text-sm">
                <span className="mb-1 block">Email</span>
                <Input type="email" placeholder="you@example.com" {...profileForm.register("email")} />
                {profileForm.formState.errors.email ? (
                  <div className="text-xs text-red-600 mt-1">{profileForm.formState.errors.email.message}</div>
                ) : null}
              </label>
              <div className="pt-2">
                <Button type="submit" variant="primary" size="md" disabled={isPending}>
                  {isPending ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-base font-medium">Change password</CardHeader>
          <CardContent className="grid gap-3 max-w-md">
            <form
              className="grid gap-3"
              onSubmit={pwdForm.handleSubmit(async (vals) => {
                try {
                  await changePassword({ currentPassword: vals.current || "", newPassword: vals.next });
                  success("Password updated");
                  pwdForm.reset({ current: "", next: "", confirm: "" });
                  setAriaStatus("Password updated");
                } catch {
                  error("Failed to update password");
                  setAriaStatus("Failed to update password");
                }
              })}
            >
              <Input type="password" placeholder="Current password" {...pwdForm.register("current")} />
              <div>
                <Input type="password" placeholder="New password" {...pwdForm.register("next")} />
                {pwdForm.formState.errors.next ? (
                  <div className="text-xs text-red-600 mt-1">{pwdForm.formState.errors.next.message}</div>
                ) : null}
              </div>
              <div>
                <Input type="password" placeholder="Confirm new password" {...pwdForm.register("confirm")} />
                {pwdForm.formState.errors.confirm ? (
                  <div className="text-xs text-red-600 mt-1">{pwdForm.formState.errors.confirm.message}</div>
                ) : null}
              </div>
              <div className="pt-1">
                <Button type="submit" variant="secondary" size="md" disabled={changing}>
                  {changing ? "Updating…" : "Update password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </RoleGuard>
  );
}
