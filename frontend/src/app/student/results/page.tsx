"use client";
import Link from "next/link";
import { useMySubmissionsQuery } from "@/hooks/useSubmissions";

type Row = { id: string; assessmentId?: string; title?: string; submittedAt?: string | null; score?: number | null; maxScore?: number | null; status?: string };

export default function StudentResults() {
  const { data: rows, isLoading, isError, error } = useMySubmissionsQuery();

  const badge = (status?: string) => {
    const s = status?.toLowerCase();
    const cls = s === "submitted" || s === "graded" || s === "passed"
      ? "bg-green-100 text-green-700"
      : s === "failed"
      ? "bg-rose-100 text-rose-700"
      : "bg-amber-100 text-amber-700";
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>{status || "—"}</span>;
  };

  if (isLoading || rows == null) {
    return <div className="text-sm text-muted">Loading results…</div>;
  }
  if (isError) {
    return <div className="text-sm text-rose-600">{(error as any)?.message || 'Failed to load results'}</div>;
  }
  if (!rows.length) {
    return <div className="text-sm text-muted">No results yet.</div>;
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-card text-muted">
          <tr>
            <th className="text-left p-3 font-medium">Submission</th>
            <th className="text-left p-3 font-medium">Assessment</th>
            <th className="text-left p-3 font-medium">Score</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {(rows as Row[]).map((r) => (
            <tr key={r.id} className="border-t hover:bg-card/60">
              <td className="p-3 font-medium">
                <Link href={{ pathname: "/student/results/[id]", query: { id: r.id } }} className="underline-offset-2 hover:underline">{r.id}</Link>
              </td>
              <td className="p-3">{r.title || r.assessmentId || "—"}</td>
              <td className="p-3">{r.score != null && r.maxScore != null ? `${r.score}/${r.maxScore}` : r.score != null ? r.score : "—"}</td>
              <td className="p-3">{badge(r.status)}</td>
              <td className="p-3">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
