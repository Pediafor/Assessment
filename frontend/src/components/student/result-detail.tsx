"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RealtimeClient } from "@/lib/realtime";
import { useQueryClient } from "@tanstack/react-query";
import { useSubmissionQuery } from "@/hooks/useSubmissions";

export function ResultDetailClient({ id }: { id: string }) {
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useSubmissionQuery(id);
  const [updated, setUpdated] = useState(false);

  // Realtime subscription: invalidate on grading.completed
  const rt = useMemo(() => new RealtimeClient(), []);
  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      try {
        await rt.connect();
        unsub = rt.subscribe('grading.completed', async (evt: any) => {
          if (evt?.submissionId === id) {
            await qc.invalidateQueries({ queryKey: ['submission', id] });
            setUpdated(true);
            setTimeout(() => setUpdated(false), 2500);
          }
        });
      } catch {}
    })();
    return () => {
      unsub?.();
      rt.disconnect();
    };
  }, [id, qc, rt]);

  if (isLoading) return <div className="text-sm text-muted">Loading…</div>;
  if (isError) return <div className="text-sm text-rose-600">{(error as any)?.message || 'Failed to load submission'}</div>;
  if (!data) return <div className="text-sm text-muted">Not found.</div>;

  const score = data.score != null && data.maxScore != null ? `${data.score}/${data.maxScore}` : data.score ?? "—";

  return (
    <div className="space-y-3">
      {updated ? (
        <div className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-xs text-green-700">
          Updated with latest grading result
        </div>
      ) : null}
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
