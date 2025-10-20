"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useNotifications";

export default function StudentNotifications() {
  const { data, isLoading } = useNotifications({ limit: 50 });
  const { mutate: markRead } = useMarkNotificationRead();
  const items = (data && data.length ? data : [
    { id: "n1", type: "reminder", title: "Assessment due soon", message: "Math Quiz due tomorrow", createdAt: new Date().toISOString() },
    { id: "n2", type: "grade", title: "Grading completed", message: "Science Midterm graded", createdAt: new Date(Date.now() - 86400000).toISOString() },
  ]) as Array<{ id: string; title: string; message?: string; createdAt: string }>;

  const unreadCount = items.filter((n: any) => !n.read).length;

  return (
    <div className="space-y-4" role="main" aria-label="Notifications">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Notifications</h2>
        {unreadCount > 0 ? (
          <button
            className="text-xs rounded-md border px-2 py-1 hover:bg-card"
            onClick={() => {
              // Optimistic: iterate visible IDs and mark read
              items.forEach((n: any) => {
                if (!n.read) markRead(n.id);
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
    </div>
  );
}
