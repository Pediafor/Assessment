import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as apiMod from '@/lib/api';
import { useNotificationsInfinite } from '@/hooks/useNotifications';

// We'll spy on the real module exports instead of auto-mocking the whole module

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useNotificationsInfinite', () => {
  it('fetches first page and next page, merges items and exposes nextCursor', async () => {
    const spy = jest
      .spyOn(apiMod.NotificationsApi, 'listMine')
      .mockResolvedValueOnce({ success: true, data: { notifications: [{ id: '1', title: 'A', createdAt: new Date().toISOString() }], nextCursor: 'c2' } } as any)
      .mockResolvedValueOnce({ success: true, data: { notifications: [{ id: '2', title: 'B', createdAt: new Date().toISOString() }], nextCursor: undefined } } as any);

    const { result } = renderHook(() => useNotificationsInfinite({ limit: 1 }), { wrapper });

    // Wait for first page
    await waitFor(() => expect(result.current.data?.pages?.[0]?.items?.length).toBe(1));
    expect(result.current.hasNextPage).toBe(true);

    // Fetch next page
    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data?.pages?.length).toBe(2));
    const merged = result.current.data?.pages?.flatMap(p => p.items) ?? [];
    expect(merged.map(i => i.id)).toEqual(['1', '2']);
    expect(result.current.hasNextPage).toBe(false);
    spy.mockRestore();
  });
});
