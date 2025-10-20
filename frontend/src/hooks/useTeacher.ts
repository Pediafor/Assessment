import { useQuery } from '@tanstack/react-query';
import { AnalyticsApi, GradesApi, UsersApi, SubmissionsApi, api } from '@/lib/api';

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

export function useTeacherStudents(params?: { page?: number; limit?: number; q?: string }) {
  return useQuery({
    queryKey: ['teacher-students', params ?? {}],
    queryFn: async () => {
      const res = await api.get('/users/students', { params });
      // Return full shape { users, total }
      return res?.data ?? res;
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

export function useStudentDetail(id?: string) {
  return useQuery({
    queryKey: ['student-detail', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/users/students/${id}`);
      const data = (res as any)?.data ?? res;
      return data?.user ?? data;
    },
  });
}

export function useStudentSubmissions(studentId?: string, limit: number = 5) {
  return useQuery({
    queryKey: ['student-submissions', studentId, limit],
    enabled: !!studentId,
    queryFn: async () => {
      const res = await SubmissionsApi.list({ studentId, limit, sortBy: 'createdAt', sortOrder: 'desc' });
      const data = (res as any);
      // Support either { data, meta } or array
      const items = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : data?.submissions ?? []);
      return items;
    },
  });
}
