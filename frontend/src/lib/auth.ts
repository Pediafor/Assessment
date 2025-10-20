export function getToken(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  } catch {
    // noop
  }
}

export function clearToken() {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  } catch {
    // noop
  }
}
