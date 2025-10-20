"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';

async function fetchGrade(submissionId: string) {
  const res = await api.get(`/api/grade/submission/${submissionId}`);
  return res.data?.data ?? res.data;
}

async function updateQuestion({ submissionId, questionId, pointsEarned, feedback }: { submissionId: string; questionId: string; pointsEarned: number; feedback?: string; }) {
  const res = await api.put(`/api/grade/submission/${submissionId}/question/${questionId}`, { pointsEarned, feedback });
  return res.data;
}

export default function RubricPage({ params }: { params: { submissionId: string } }) {
  const { submissionId } = params;
  const qc = useQueryClient();

  const { data: grade, isLoading } = useQuery({
    queryKey: ['grade', submissionId],
    queryFn: () => fetchGrade(submissionId),
  });

  const mutation = useMutation({
    mutationFn: updateQuestion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grade', submissionId] });
    }
  });

  if (isLoading) return <div className="p-4">Loading…</div>;
  if (!grade) return <div className="p-4">No grade found for submission.</div>;

  return (
    <div role="main" aria-label="Manual grading rubric" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Manual Grading</h2>
        <Link href="/teacher/grading" className="text-sm underline">Back to queue</Link>
      </div>
      <div className="rounded-md border p-4">
        <div className="text-sm text-muted">Submission</div>
        <div className="font-medium">{submissionId}</div>
        <div className="text-sm">Score: {grade.totalScore} / {grade.maxScore} ({(grade.percentage)?.toFixed(1)}%)</div>
      </div>
      <div className="space-y-3">
        {grade.questionGrades?.map((q: any) => (
          <div key={q.questionId} className="rounded-md border p-4">
            <div className="font-medium">Question {q.questionId}</div>
            <div className="text-sm text-muted">Max: {q.maxPoints}</div>
            <form className="mt-2 flex flex-col gap-2" onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const fd = new FormData(form);
              const points = Number(fd.get('points'));
              const feedback = String(fd.get('feedback') || '');
              mutation.mutate({ submissionId, questionId: q.questionId, pointsEarned: points, feedback });
            }}>
              <div className="flex items-center gap-2">
                <label className="text-sm" htmlFor={`points-${q.questionId}`}>Points</label>
                <input id={`points-${q.questionId}`} name="points" type="number" step="0.01" min={0} max={q.maxPoints} defaultValue={q.pointsEarned ?? 0} className="w-28 rounded-md border px-2 py-1 text-sm" />
                <button type="submit" className="rounded-md border px-3 py-1 text-sm">Save</button>
              </div>
              <textarea name="feedback" placeholder="Feedback (optional)" defaultValue={q.feedback ?? ''} className="mt-2 w-full rounded-md border p-2 text-sm" rows={2} />
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
