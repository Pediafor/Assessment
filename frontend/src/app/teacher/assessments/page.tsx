"use client";
import { useTeacherAssessments } from '@/hooks/useTeacher';
import { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function TeacherAssessments() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<string>(params.get('status') || '');
  const [search, setSearch] = useState<string>(params.get('q') || '');
  const [subject, setSubject] = useState<string>(params.get('subject') || '');
  const query = useMemo(() => ({ status: status || undefined, search: search || undefined, subject: subject || undefined }), [status, search, subject]);
  const { data: fetched = [], isLoading } = useTeacherAssessments(query);
  const fallback = [
    { id: "ENG-101", title: "English Vocabulary Quiz", questions: 20, assigned: 32, status: "Draft" },
    { id: "MTH-201", title: "Algebra Midterm", questions: 35, assigned: 2, status: "Scheduled" },
    { id: "SCI-110", title: "Physics Basics", questions: 15, assigned: 30, status: "Published" },
    { id: "HIS-201", title: "World History Essay", questions: 1, assigned: 25, status: "Closed" },
  ];
  const items = (Array.isArray(fetched) && fetched.length ? fetched : fallback) as any[];
  const badge = (s: string) => {
    const map: Record<string, string> = {
      Draft: "bg-gray-100 text-gray-700",
      Scheduled: "bg-blue-100 text-blue-700",
      Published: "bg-green-100 text-green-700",
      Closed: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
    };
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${map[s] || "bg-gray-100 text-gray-700"}`}>{s}</span>;
  };
  const applyFilters = () => {
    const q = new URLSearchParams();
    if (status) q.set('status', status);
    if (search) q.set('q', search);
    if (subject) q.set('subject', subject);
    router.replace(`/teacher/assessments${q.toString() ? `?${q.toString()}` : ''}` as any);
  };
  if (isLoading) return <div>Loading…</div>;
  return (
    <div role="main" aria-label="Teacher assessments" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Assessments</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input className="rounded-md border px-2 py-1 text-sm" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
          <input className="rounded-md border px-2 py-1 text-sm" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <select className="rounded-md border px-2 py-1 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PUBLISHED">Published</option>
            <option value="CLOSED">Closed</option>
          </select>
          <button onClick={applyFilters} className="rounded-md border px-3 py-2 text-sm hover:bg-card">Apply</button>
          <a href="/teacher/assessments/create" className="rounded-md border px-3 py-2 text-sm hover:bg-card">Create Assessment</a>
        </div>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-card text-muted">
            <tr>
              <th className="text-left p-3 font-medium">Code</th>
              <th className="text-left p-3 font-medium">Title</th>
              <th className="text-left p-3 font-medium">Questions</th>
              <th className="text-left p-3 font-medium">Assigned</th>
              <th className="text-left p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">{r.id}</td>
                <td className="p-3">{r.title}</td>
                <td className="p-3">{r.questions}</td>
                <td className="p-3">{r.assigned}</td>
                <td className="p-3">{badge(r.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
