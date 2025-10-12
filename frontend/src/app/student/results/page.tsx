"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listMySubmissions } from "@/lib/services/assessments";

type Row = { id: string; assessmentId?: string; title?: string; submittedAt?: string | null; score?: number | null; maxScore?: number | null; status?: string };

export default function StudentResults() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listMySubmissions();
        if (!cancelled) setRows(data && data.length ? data : []);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load results");
          setRows([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const badge = (status?: string) => {
    const s = status?.toLowerCase();
    const cls = s === "submitted" || s === "graded" || s === "passed"
      ? "bg-green-100 text-green-700"
      : s === "failed"
      ? "bg-rose-100 text-rose-700"
      : "bg-amber-100 text-amber-700";
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>{status || "—"}</span>;
  };

  if (rows == null) {
    return <div className="text-sm text-muted">Loading results…</div>;
  }
  if (error) {
    return <div className="text-sm text-rose-600">{error}</div>;
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
          {rows.map((r) => (
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
