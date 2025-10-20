import { SubmissionsApi, api } from "@/lib/api";

export type AssessmentListItem = {
  id: string;
  title: string;
  due?: string;
  status?: "Assigned" | "In Progress" | "Completed" | "Late" | "Draft" | string;
};

// API docs: list returns { success, data: { assessments, meta } }
export async function listAssessments(params?: { status?: string; subject?: string; search?: string }): Promise<AssessmentListItem[]> {
  const { status = 'PUBLISHED', subject, search } = params || {};
  const res = await api.get<{ success?: boolean; data?: { assessments?: AssessmentListItem[] } }>(
    "/api/assessments",
    { params: { status, subject, q: search } }
  );
  return res.data?.data?.assessments ?? [];
}

// API docs: POST /submissions => { success, data: { id, ... } }
export async function startSubmission(assessmentId: string): Promise<{ submissionId: string | null }> {
  const res = await SubmissionsApi.create({ assessmentId });
  const id = (res?.data?.id) ?? res?.id ?? null;
  return { submissionId: id };
}

// API docs: POST /submissions/:id/save-answers with { answers }
export async function saveSubmissionProgress(
  submissionId: string,
  payload:
    | { answers: Record<string, unknown>; metadata?: Record<string, unknown> }
    | Record<string, unknown>
) {
  let body: any;
  if ("answers" in payload) {
    const { answers, metadata, ...rest } = payload as any;
    body = { answers: answers ?? {}, metadata: { ...(metadata || {}), ...(Object.keys(rest).length ? rest : {}) } };
  } else {
    const { answers, ...rest } = (payload as any) ?? {};
    body = { answers: answers ?? {}, metadata: Object.keys(rest).length ? rest : undefined };
  }
  await SubmissionsApi.saveAnswers(submissionId, body.answers);
}

export async function submitSubmission(submissionId: string) {
  await SubmissionsApi.submit(submissionId);
}

export async function getSubmission(submissionId: string): Promise<{
  id: string;
  assessmentId?: string;
  title?: string;
  status?: string;
  answers?: Record<string, unknown> | null;
  score?: number | null;
  maxScore?: number | null;
  submittedAt?: string | null;
  metadata?: any;
}> {
  const res = await SubmissionsApi.get(submissionId);
  return res?.data ?? res ?? {};
}

export async function listMySubmissions(): Promise<Array<{
  id: string;
  assessmentId?: string;
  title?: string;
  submittedAt?: string | null;
  score?: number | null;
  maxScore?: number | null;
  status?: string;
}>> {
  const res = await SubmissionsApi.list();
  const data = res?.data ?? res;
  return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
}
