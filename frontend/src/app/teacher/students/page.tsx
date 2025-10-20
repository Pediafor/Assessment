"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useTeacherStudents } from '@/hooks/useTeacher';

export default function TeacherStudents() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [q, setQ] = useState("");
  const { data, isLoading, isFetching } = useTeacherStudents({ page, limit, q });

  const rows = useMemo(() => {
    const list = Array.isArray((data as any)?.users) ? (data as any).users : (Array.isArray(data) ? data : []);
    if (list.length) return list;
    return [] as any[];
  }, [data]);

  const total = (data as any)?.total ?? rows.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div role="main" aria-label="Teacher students" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Students</h2>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search name or email..."
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value); }}
            className="border rounded px-3 py-1.5 text-sm"
            aria-label="Search students"
          />
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-card text-muted">
            <tr>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Last login</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td className="p-3" colSpan={5}>Loading…</td></tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr><td className="p-3" colSpan={5}>No students found</td></tr>
            )}
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">{[r.firstName, r.lastName].filter(Boolean).join(' ') || r.email}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">{r.lastLogin ? new Date(r.lastLogin).toLocaleString() : '—'}</td>
                <td className="p-3">{r.isActive ? "Active" : "Inactive"}</td>
                <td className="p-3 text-right">
                  <Link href={("/teacher/students/" + r.id) as any} className="rounded-md border px-3 py-1.5 text-xs hover:bg-card mr-2">View</Link>
                  <button className="rounded-md border px-3 py-1.5 text-xs hover:bg-card">Message</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>
          Page {page} of {totalPages} {isFetching ? '(updating...)' : ''}
        </div>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="border rounded px-2 py-1 disabled:opacity-50">Prev</button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="border rounded px-2 py-1 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
