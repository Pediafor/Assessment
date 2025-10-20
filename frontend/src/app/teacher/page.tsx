"use client";
import { useGradingQueue, useTeacherOverview } from '@/hooks/useTeacher';

export default function TeacherHome() {
  const { data: overviewRes } = useTeacherOverview() as any;
  const { data: queueRes, isLoading: queueLoading } = useGradingQueue() as any;
  const overview = overviewRes?.data ?? overviewRes ?? { avgScore: null, completed: null, pendingGrading: null };
  const queue = (queueRes?.items ?? queueRes ?? []).slice(0, 6);
  return (
    <div role="main" aria-label="Teacher dashboard" className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold mb-2">My Assessments</h2>
        <div className="rounded-md border p-4 text-sm text-muted">Create, edit or assign assessments from the Assessments tab.</div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Grading Queue</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {queueLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-md border p-4 text-sm text-muted">Loading…</div>
            ))
          ) : queue.length ? (
            queue.map((item: any) => (
              <div key={item.id || item.submissionId} className="rounded-md border p-4">
                <div className="font-medium">Submission {item.id || item.submissionId}</div>
                <div className="text-sm text-muted">{item.reason || 'Needs manual review'}</div>
              </div>
            ))
          ) : (
            <div className="rounded-md border p-4 text-sm text-muted">No pending grading items</div>
          )}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Class Analytics</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border p-4">
            <div className="text-sm text-muted">Average Score</div>
            <div className="text-2xl font-semibold">{overview.avgScore ?? '—'}</div>
          </div>
          <div className="rounded-md border p-4">
            <div className="text-sm text-muted">Completed</div>
            <div className="text-2xl font-semibold">{overview.completed ?? '—'}</div>
          </div>
          <div className="rounded-md border p-4">
            <div className="text-sm text-muted">Pending Grading</div>
            <div className="text-2xl font-semibold">{overview.pendingGrading ?? '—'}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
