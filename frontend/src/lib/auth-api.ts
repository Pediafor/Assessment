import { api } from '@/lib/api';
import { setToken, clearToken } from '@/lib/auth';

type LoginResponse = {
  accessToken?: string;
  token?: string;
  role?: 'admin' | 'teacher' | 'student';
  user?: { role?: string };
  message?: string;
} | any;

export async function apiLogin(email: string, password: string): Promise<'admin' | 'teacher' | 'student'> {
  // Expected gateway path per docs: /api/auth/login → User Service
  try {
    const { data } = await api.post<LoginResponse>('/api/auth/login', { email, password });
    const token = data?.accessToken || data?.token || data?.data?.accessToken || data?.data?.token;
    const role = (data?.role || data?.user?.role || data?.data?.role || data?.data?.user?.role || '').toString().toLowerCase();
    if (!token) throw new Error('Invalid auth response');
    setToken(token);
    const normalized = role === 'admin' || role === 'teacher' || role === 'student' ? role : null;
    if (!normalized) throw new Error('Invalid login response: missing role');
    if (typeof window !== 'undefined') localStorage.setItem('auth_role', normalized);
    return normalized;
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Login failed';
    throw new Error(msg);
  }
}

export async function apiLogout(): Promise<void> {
  try {
    await api.post('/api/auth/logout');
  } catch {
    // ignore network issues on logout
  } finally {
    clearToken();
  }
}

export async function apiMe(): Promise<{ role: 'admin' | 'teacher' | 'student' } | null> {
  try {
    const { data } = await api.get<any>('/api/auth/me');
    const roleRaw = data?.role || data?.data?.role || data?.user?.role || data?.data?.user?.role;
    const role = typeof roleRaw === 'string' ? roleRaw.toLowerCase() : undefined;
    if (role === 'admin' || role === 'teacher' || role === 'student') return { role };
    return null;
  } catch {
    return null;
  }
}

// Registration and password flows
export async function apiRegister(payload: { name?: string; email: string; password: string; role?: 'STUDENT' | 'TEACHER' | 'ADMIN' }) {
  // Per docs: POST /api/users/register
  const { data } = await api.post('/api/users/register', payload);
  return data;
}

export async function apiForgotPassword(email: string) {
  // Common path: /api/auth/forgot-password { email }
  const { data } = await api.post('/api/auth/forgot-password', { email });
  return data;
}

export async function apiResetPassword(token: string, password: string) {
  // Common path: /api/auth/reset-password { token, password }
  const { data } = await api.post('/api/auth/reset-password', { token, password });
  return data;
}
