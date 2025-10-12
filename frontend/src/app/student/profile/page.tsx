"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StudentProfile() {
  const [name, setName] = useState("Student User");
  const [email, setEmail] = useState("student@pediafor.com");

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Wire to API
    alert("Profile saved (demo)");
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
        <Button type="submit">Save changes</Button>
      </form>
      <div>
        <h3 className="text-lg font-semibold mb-2">Change Password</h3>
        <div className="space-y-3">
          <Input type="password" placeholder="Current password" />
          <Input type="password" placeholder="New password" />
          <Input type="password" placeholder="Confirm new password" />
          <Button variant="secondary" type="button">Update password</Button>
        </div>
      </div>
    </div>
  );
}
