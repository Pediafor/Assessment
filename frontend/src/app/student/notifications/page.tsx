"use client";
import { useEffect, useMemo, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationsInfinite, useMarkNotificationRead } from "@/hooks/useNotifications";
import { NotificationsApi } from "@/lib/api";

export default function StudentNotifications() {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useNotificationsInfinite({ limit: 50 });
  const { mutate: markRead } = useMarkNotificationRead();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const items = useMemo(() => {
    const merged = (data?.pages?.flatMap(p => p.items) ?? []) as Array<{ id: string; title: string; message?: string; createdAt: string; read?: boolean }>;
    if (merged.length) return merged;
    // graceful fallback demo data
    return [
      { id: "n1", type: "reminder", title: "Assessment due soon", message: "Math Quiz due tomorrow", createdAt: new Date().toISOString() },
      { id: "n2", type: "grade", title: "Grading completed", message: "Science Midterm graded", createdAt: new Date(Date.now() - 86400000).toISOString() },
    ];
  }, [data]);

  const unreadCount = items.filter((n: any) => !n.read).length;

  // Auto-load more when sentinel is visible
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      }
    }, { root: null, rootMargin: '200px 0px', threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, items?.length]);

  return (
    <div className="space-y-4" role="main" aria-label="Notifications">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Notifications</h2>
        {unreadCount > 0 ? (
          <button
            className="text-xs rounded-md border px-2 py-1 hover:bg-card"
            onClick={() => {
              const ids = items.filter((n: any) => !n.read).map((n: any) => n.id);
              // Try optional bulk endpoint; fallback to per-item
              NotificationsApi.bulkMarkRead(ids).catch(() => {
                ids.forEach((id) => markRead(id));
              });
            }}
          >
            Mark all as read
          </button>
        ) : null}
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : items && items.length ? (
        <ul className="divide-y rounded-md border">
          {items.map((n: any) => (
            <li key={n.id} className={`p-4 ${!n.read ? 'bg-amber-50/40' : ''}`}>
              <div className="flex items-center justify-between">
                <div className={`font-medium ${!n.read ? 'text-amber-700' : ''}`}>{n.title}</div>
                <div className="text-xs text-muted">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {n.message ? <div className={`text-sm mt-1 ${!n.read ? 'text-amber-700/80' : 'text-muted'}`}>{n.message}</div> : null}
              <div className="mt-2 flex justify-end">
                <button
                  className="rounded-md border px-2 py-1 text-xs hover:bg-card"
                  onClick={() => markRead(n.id)}
                >
                  Mark as read
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-muted">You're all caught up.</div>
      )}
      {/* Pagination controls */}
      {/* Auto-load sentinel */}
      <div ref={sentinelRef} aria-hidden className="h-1" />
      {data && (hasNextPage || isFetchingNextPage) ? (
        <div className="flex justify-center pt-2">
          <button
            disabled={!hasNextPage || isFetchingNextPage}
            onClick={() => fetchNextPage()}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-card disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading…' : hasNextPage ? 'Load more' : 'No more'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
