export default function AdminUsers() {
  const users = [
    { name: "Alice Johnson", email: "alice@example.com", role: "admin", status: "active" },
    { name: "Bob Smith", email: "bob@example.com", role: "teacher", status: "active" },
    { name: "Carol Lee", email: "carol@example.com", role: "student", status: "suspended" },
  ] as const;
  const roleBadge = (role: string) =>
    ({
      admin: "bg-purple-100 text-purple-700",
      teacher: "bg-blue-100 text-blue-700",
      student: "bg-green-100 text-green-700",
    }[role] ?? "bg-gray-100 text-gray-700");
  const statusBadge = (status: string) =>
    ({
      active: "bg-emerald-100 text-emerald-700",
      suspended: "bg-amber-100 text-amber-700",
    }[status] ?? "bg-gray-100 text-gray-700");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Users</h2>
        <button className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-black">
          Add User
        </button>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-zinc-900/40 text-left text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="border-t">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge(u.role)}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(u.status)}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button className="rounded border px-2 py-1 text-xs">Edit</button>
                  <button className="rounded border px-2 py-1 text-xs">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
