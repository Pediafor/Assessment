import { getToken, setToken, clearToken } from '@/lib/auth';

describe('auth helpers', () => {
  it('set/get/clear token roundtrip', () => {
    clearToken();
    expect(getToken()).toBeNull();
    setToken('abc');
    expect(getToken()).toBe('abc');
    clearToken();
    expect(getToken()).toBeNull();
  });
});
