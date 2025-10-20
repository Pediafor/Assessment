"use client";
import { useTeacherStudents } from '@/hooks/useTeacher';

export default function TeacherStudents() {
  const { data: fetched = [], isLoading } = useTeacherStudents();
  const rows = (Array.isArray(fetched) && fetched.length ? fetched : [
    { id: "S-001", name: "Jane Doe", email: "jane@example.com", active: true },
    { id: "S-002", name: "John Smith", email: "john@example.com", active: true },
    { id: "S-003", name: "Alex Lee", email: "alex@example.com", active: false },
  ]) as any[];
  if (isLoading) return <div>Loading…</div>;
  return (
    <div role="main" aria-label="Teacher students" className="space-y-4">
      <h2 className="text-xl font-semibold">Students</h2>
      <div className="rounded-md border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-card text-muted">
            <tr>
              <th className="text-left p-3 font-medium">ID</th>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">{r.id}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">{r.active ? "Active" : "Inactive"}</td>
                <td className="p-3 text-right">
                  <button className="rounded-md border px-3 py-1.5 text-xs hover:bg-card mr-2">Assign</button>
                  <button className="rounded-md border px-3 py-1.5 text-xs hover:bg-card">Message</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
