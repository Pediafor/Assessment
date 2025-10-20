import { useQuery } from '@tanstack/react-query';
import { AnalyticsApi, GradesApi, UsersApi, api } from '@/lib/api';

export function useTeacherAssessments(params?: { status?: string; search?: string; subject?: string }) {
  const { status, search, subject } = params || {};
  return useQuery({
    queryKey: ['teacher-assessments', { status, search, subject }],
    queryFn: async () => {
  const res = await api.get('/assessments', { params: { status, q: search, subject } });
      return res.data?.data?.assessments ?? res.data?.assessments ?? [];
    },
  });
}

export function useGradingQueue() {
  return useQuery({
    queryKey: ['grading-queue'],
    queryFn: async () => {
      const res = await GradesApi.queue();
      return res?.data?.items ?? res?.items ?? [];
    },
  });
}

export function useTeacherStudents(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['teacher-students', params ?? {}],
    queryFn: async () => {
      const res = await UsersApi.list({ ...(params || {}), role: 'STUDENT' });
      const data = res?.data ?? res;
      return Array.isArray(data?.users) ? data.users : (Array.isArray(data) ? data : []);
    },
  });
}

export function useTeacherOverview() {
  return useQuery({
    queryKey: ['teacher-overview'],
    queryFn: async () => {
      const res = await AnalyticsApi.teacherOverview();
      return res?.data ?? res ?? {};
    },
  });
}
