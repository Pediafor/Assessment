"use client";
import React from "react";
import Link from "next/link";
import { useAssessmentsQuery, useMySubmissionsQuery } from "@/hooks/useSubmissions";
import { useRealtimeInvalidation } from "@/hooks/useRealtimeInvalidation";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";

export default function StudentHome() {
  useRealtimeInvalidation();
  const { data: assessments, isLoading: aLoading } = useAssessmentsQuery({ status: "PUBLISHED" });
  const { data: submissions, isLoading: sLoading } = useMySubmissionsQuery();

  const assigned = assessments ?? [];
  const completed = (submissions ?? []).filter((s) => (s.status || "").toLowerCase().includes("complete"));
  const inProgress = (submissions ?? []).filter((s) => (s.status || "").toLowerCase().includes("progress"));
  const dueSoon = assigned.filter(a => a.due && (new Date(a.due).getTime() - Date.now()) < 1000 * 60 * 60 * 24 * 3); // 3 days

  return (
    <div className="space-y-10">
      <section aria-label="Summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border p-4">
          <div className="text-sm text-muted">Assigned</div>
          <div className="text-2xl font-semibold">{aLoading ? '—' : assigned.length}</div>
        </div>
        <div className="rounded-md border p-4">
          <div className="text-sm text-muted">In Progress</div>
          <div className="text-2xl font-semibold">{sLoading ? '—' : inProgress.length}</div>
        </div>
        <div className="rounded-md border p-4">
          <div className="text-sm text-muted">Completed</div>
          <div className="text-2xl font-semibold">{sLoading ? '—' : completed.length}</div>
        </div>
        <div className="rounded-md border p-4">
          <div className="text-sm text-muted">Due soon (3d)</div>
          <div className="text-2xl font-semibold">{aLoading ? '—' : dueSoon.length}</div>
        </div>
      </section>
      <section aria-labelledby="assigned-heading">
        <h2 id="assigned-heading" className="text-xl font-semibold mb-3">Assigned</h2>
        {aLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : assigned.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {assigned.slice(0, 6).map((a) => (
              <Link key={a.id} href={`/student/assessment/${a.id}`} className="rounded-md border p-4 hover:bg-card">
                <div className="font-medium line-clamp-1">{a.title || `Assessment ${a.id}`}</div>
                <div className="mt-1 text-sm text-muted">
                  {a.due ? `Due ${new Date(a.due).toLocaleDateString()}` : "Assigned"}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty title="No assigned assessments" description="You're all caught up." />
        )}
      </section>

      <section aria-labelledby="progress-heading">
        <h2 id="progress-heading" className="text-xl font-semibold mb-3">In Progress</h2>
        {sLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : inProgress.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.slice(0, 3).map((r) => (
              <Link key={r.id} href={`/student/assessment/${r.assessmentId || r.id}`} className="rounded-md border p-4 hover:bg-card">
                <div className="flex items-center justify-between">
                  <div className="font-medium line-clamp-1">{r.title || r.assessmentId || r.id}</div>
                  <span className="text-xs text-muted">Continue</span>
                </div>
                <div className="mt-1 text-xs text-muted">Resume where you left off</div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty title="No drafts right now" />
        )}
      </section>

      <section aria-labelledby="completed-heading">
        <h2 id="completed-heading" className="text-xl font-semibold mb-3">Completed</h2>
        {sLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : completed.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {completed.slice(0, 6).map((r) => (
              <Link key={r.id} href={`/student/results/${r.id}`} className="rounded-md border p-4 hover:bg-card">
                <div className="flex items-center justify-between">
                  <div className="font-medium line-clamp-1">{r.title || r.assessmentId || r.id}</div>
                  <Badge variant="success">{r.score != null && r.maxScore ? `${r.score}/${r.maxScore}` : "Graded"}</Badge>
                </div>
                <div className="mt-1 text-xs text-muted">
                  {r.submittedAt ? `Submitted ${new Date(r.submittedAt).toLocaleDateString()}` : "Submitted"}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty title="Your recent results will appear here" />
        )}
      </section>
    </div>
  );
}
