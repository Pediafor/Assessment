export default function AdminSettings() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">General</h2>
        <div className="rounded-md border p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Organization Name</label>
            <input className="w-full rounded-md border bg-transparent px-3 py-2" placeholder="Acme University" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Support Email</label>
            <input type="email" className="w-full rounded-md border bg-transparent px-3 py-2" placeholder="support@example.com" />
          </div>
          <button className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-black">Save</button>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Security</h2>
        <div className="rounded-md border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Require 2FA</div>
              <div className="text-xs text-muted">Enforce two-factor authentication for all users</div>
            </div>
            <input type="checkbox" className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Password Rotation</div>
              <div className="text-xs text-muted">Force password change every 90 days</div>
            </div>
            <input type="checkbox" className="h-4 w-4" />
          </div>
          <button className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-black">Update Security</button>
        </div>
      </section>
    </div>
  );
}
