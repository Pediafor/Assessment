"use client";
import { useGradingQueue } from '@/hooks/useTeacher';
import Link from 'next/link';

export default function TeacherGrading() {
  const { data: fetched = [], isLoading } = useGradingQueue();
  const queue = (Array.isArray(fetched) && fetched.length ? fetched : [
    { id: "MTH-201-23", student: "Jane Doe", assessment: "Algebra Midterm", submitted: "2025-10-10", status: "New" },
    { id: "SCI-110-07", student: "John Smith", assessment: "Physics Basics", submitted: "2025-10-09", status: "Late" },
    { id: "ENG-101-33", student: "Alex Lee", assessment: "English Vocabulary Quiz", submitted: "2025-10-12", status: "Urgent" },
  ]) as any[];
  const badge = (s: string) => {
    const map: Record<string, string> = {
      New: "bg-blue-100 text-blue-700",
      Late: "bg-rose-100 text-rose-700",
      Urgent: "bg-amber-100 text-amber-700",
    };
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${map[s] || "bg-gray-100 text-gray-700"}`}>{s}</span>;
  };
  if (isLoading) return <div>Loading…</div>;
  return (
    <div role="main" aria-label="Teacher grading" className="space-y-4">
      <h2 className="text-xl font-semibold">Grading Queue</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {queue.map((q) => (
          <div key={q.id} className="rounded-md border p-4">
            <div className="font-medium">{q.assessment}</div>
            <div className="text-sm text-muted">Student: {q.student}</div>
            <div className="text-sm text-muted">Submitted: {q.submitted}</div>
            <div className="mt-2">{badge(q.status!)}</div>
            <div className="mt-3">
              {q.submissionId ? (
                <Link href={("/teacher/grading/" + String(q.submissionId)) as any} className="rounded-md border px-3 py-2 text-sm hover:bg-card inline-block">Open</Link>
              ) : (
                <button className="rounded-md border px-3 py-2 text-sm hover:bg-card" disabled>Open</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
