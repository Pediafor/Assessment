"use client";
import { useQuery } from '@tanstack/react-query';
import { getSubmission, listMySubmissions, listAssessments, type AssessmentListItem } from '@/lib/services/assessments';

export function useSubmissionQuery(id: string) {
  return useQuery({
    queryKey: ['submission', id],
    queryFn: () => getSubmission(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useMySubmissionsQuery() {
  return useQuery({
    queryKey: ['my-submissions'],
    queryFn: () => listMySubmissions(),
    staleTime: 30_000,
  });
}

export function useAssessmentsQuery(opts?: { status?: string; search?: string }) {
  return useQuery<AssessmentListItem[]>({
    queryKey: ['assessments', { status: opts?.status || 'PUBLISHED', q: opts?.search || '' }],
    queryFn: () => listAssessments(),
    staleTime: 30_000,
  });
}
