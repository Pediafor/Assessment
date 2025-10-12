"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSubmission } from "@/lib/services/assessments";

export function ResultDetailClient({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sub = await getSubmission(id);
        if (!cancelled) {
          setData(sub);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load submission");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="text-sm text-muted">Loading…</div>;
  if (error) return <div className="text-sm text-rose-600">{error}</div>;
  if (!data) return <div className="text-sm text-muted">Not found.</div>;

  const score = data.score != null && data.maxScore != null ? `${data.score}/${data.maxScore}` : data.score ?? "—";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Submission {data.id}</h1>
        <Link href="/student/results" className="text-sm underline-offset-2 hover:underline">Back to Results</Link>
      </div>
      <div className="rounded-md border p-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div><span className="text-muted">Assessment:</span> <span className="font-medium">{data.title || data.assessmentId || "—"}</span></div>
          <div><span className="text-muted">Status:</span> <span className="font-medium">{data.status || "—"}</span></div>
          <div><span className="text-muted">Score:</span> <span className="font-medium">{score}</span></div>
          <div><span className="text-muted">Submitted:</span> <span className="font-medium">{data.submittedAt ? new Date(data.submittedAt).toLocaleString() : "—"}</span></div>
        </div>
      </div>
      {data.answers ? (
        <div className="rounded-md border p-4">
          <div className="text-sm font-medium mb-2">Your answers</div>
          <pre className="overflow-auto text-xs bg-card p-3 rounded-md">{JSON.stringify(data.answers, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
}
