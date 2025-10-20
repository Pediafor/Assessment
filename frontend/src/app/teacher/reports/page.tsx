"use client";
import { useTeacherOverview } from '@/hooks/useTeacher';

export default function TeacherReports() {
  const { data, isLoading } = useTeacherOverview();
  const kpis = [
    { label: "Avg. Score", value: data?.avgScore != null ? `${data.avgScore}%` : "78%" },
    { label: "Completed", value: data?.completed != null ? String(data.completed) : "124" },
    { label: "Pending Grading", value: data?.pendingGrading != null ? String(data.pendingGrading) : "9" },
  ];
  return (
    <div role="main" aria-label="Teacher reports" className="space-y-6">
      <h2 className="text-xl font-semibold">Reports</h2>
      {isLoading && <div className="text-sm text-muted">Loading…</div>}
      <div className="grid gap-3 sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-md border p-4">
            <div className="text-sm text-muted">{k.label}</div>
            <div className="text-2xl font-semibold">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-md border p-6 text-sm text-muted">
        Charts coming soon
      </div>
    </div>
  );
}
