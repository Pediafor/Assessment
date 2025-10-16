"use client";
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeInvalidation() {
  const qc = useQueryClient();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = (process.env.NEXT_PUBLIC_REALTIME_URL || 'ws://localhost:8080/realtime').replace(/\/$/, '');
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(url);
    } catch {
      return;
    }
    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        const type = msg?.type || msg?.eventType;
        switch (type) {
          case 'submission.submitted':
          case 'submission.updated':
            qc.invalidateQueries({ queryKey: ['my-submissions'] });
            break;
          case 'grading.completed':
            qc.invalidateQueries({ queryKey: ['submission'] });
            qc.invalidateQueries({ queryKey: ['my-submissions'] });
            break;
          case 'assessment.published':
          case 'assessment.updated':
            qc.invalidateQueries({ queryKey: ['assessments'] });
            break;
          default:
            break;
        }
      } catch {}
    };
    return () => {
      try { ws?.close(); } catch {}
    };
  }, [qc]);
}
