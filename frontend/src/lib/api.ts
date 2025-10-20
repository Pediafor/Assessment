import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { setToken, clearToken } from './auth';

// Build a normalized baseURL so that request paths like '/api/...'
// don't accidentally become '/api/api/...'
function normalizeBaseURL(raw?: string) {
  if (!raw) return '';
  let url = raw.trim();
  // remove trailing slash
  if (url.endsWith('/')) url = url.slice(0, -1);
  // strip a trailing '/api' (with or without trailing slash)
  if (url.toLowerCase().endsWith('/api')) url = url.slice(0, -4);
  return url;
}

const baseURL = normalizeBaseURL(process.env.NEXT_PUBLIC_API_URL) || normalizeBaseURL(process.env.NEXT_PUBLIC_GATEWAY_URL) || '';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Automatic refresh on 401 using httpOnly session cookie ---
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function onRefreshed(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean });
    const status = error.response?.status;

    if (typeof window !== 'undefined' && status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const { data } = await api.post('/api/auth/refresh');
          const newToken: string | undefined = (data as any)?.accessToken || (data as any)?.token;
          if (!newToken) throw new Error('No access token from refresh');
          setToken(newToken);
          onRefreshed(newToken);
        } catch (e) {
          onRefreshed(null);
          clearToken();
          // Redirect to login after failed refresh
          window.location.href = '/login';
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      }

      // Queue the current request until refresh completes
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) return reject(error);
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
          }
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export const SubmissionsApi = {
  list: (params?: Record<string, any>) => api.get('/submissions', { params }).then(r => r.data),
  get: (id: string) => api.get(`/submissions/${id}`).then(r => r.data),
  create: (payload: { assessmentId: string }) => api.post('/submissions', payload).then(r => r.data),
  saveAnswers: (id: string, answers: any) => api.post(`/submissions/${id}/answers`, { answers }).then(r => r.data),
  submit: (id: string) => api.post(`/submissions/${id}/submit`).then(r => r.data),
};

export const NotificationsApi = {
  // Proposed route/shape:
  // GET /api/notifications?scope=me&limit=50&after=<cursor>
  // returns { success: true, data: { notifications: Notification[], nextCursor?: string } }
  listMine: (params?: { limit?: number; after?: string }) =>
    api
      .get('/notifications', { params: { scope: 'me', ...(params || {}) } })
      .then(r => r.data),
  // POST /api/notifications/:id/read -> { success: true }
  markRead: (id: string) => api.post(`/notifications/${id}/read`).then(r => r.data),
  // Optional bulk endpoint: POST /api/notifications/read { ids: string[] }
  bulkMarkRead: (ids: string[]) => api.post('/notifications/read', { ids }).then(r => r.data),
};

export const UsersApi = {
  me: () => api.get('/api/auth/me').then(r => r.data),
  updateProfile: (payload: { name?: string; email?: string }) => api.put('/users/profile', payload).then(r => r.data),
  changePassword: (payload: { currentPassword: string; newPassword: string }) => api.put('/users/password', payload).then(r => r.data),
  list: (params?: { role?: string; page?: number; limit?: number }) =>
    api.get('/users', { params }).then(r => r.data),
};

export const GradesApi = {
  // Implemented via grading-service: GET /grade/queue -> { success, data: { items: [...] } }
  queue: () => api
    .get('/grade/queue')
    .then(r => r.data)
    .catch(() => ({ success: true, data: { items: [] } })),
};

export const AnalyticsApi = {
  // Implemented via grading-service: GET /grade/analytics/teacher/overview
  teacherOverview: () => api
    .get('/grade/analytics/teacher/overview')
    .then(r => r.data)
    .catch(() => ({ success: true, data: { avgScore: null, completed: null, pendingGrading: null } })),
};
