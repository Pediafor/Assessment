export type RealtimeEvent = {
  type: 'event' | 'success' | 'error';
  eventType?: string;
  data?: any;
  timestamp?: number;
  error?: string;
};

export class RealtimeClient {
  private ws?: WebSocket; // legacy fallback
  private url: string;
  private token?: string;
  private handlers = new Map<string, Set<(data: any) => void>>();
  private transport: any | null = null;
  private pendingSubs = new Map<string, (ok: boolean) => void>();

  constructor(url = process.env.NEXT_PUBLIC_REALTIME_URL || 'ws://localhost:8080/realtime', token?: string) {
    this.url = url;
    this.token = token;
  }

  async connect() {
    const withToken = this.token ? `${this.url}?token=${encodeURIComponent(this.token)}` : this.url;
    // Prefer WebTransport if available; fallback to WebSocket
    try {
      const { createTransport } = await import('./transport');
      const primaryUrl = withToken.replace('ws://', 'https://').replace('wss://', 'https://');
      this.transport = await createTransport(primaryUrl, withToken);
      this.transport.onMessage((msg: RealtimeEvent) => this.dispatch(msg));
      if (this.token) {
        // Explicitly authenticate for topic scoping even when token is in URL
        this.transport.send({ type: 'authenticate', data: { token: this.token } });
      }
    } catch {
      this.ws = new WebSocket(withToken);
      this.ws.onmessage = (evt) => {
        try { this.dispatch(JSON.parse(evt.data) as RealtimeEvent); } catch {}
      };
      await new Promise<void>((resolve) => { this.ws!.onopen = () => resolve(); });
      if (this.token) this.ws!.send(JSON.stringify({ type: 'authenticate', data: { token: this.token } }));
    }
  }

  authenticate(token: string) {
    this.token = token;
    if (this.transport) this.transport.send({ type: 'authenticate', data: { token } });
    else this.ws?.send(JSON.stringify({ type: 'authenticate', data: { token } }));
  }

  subscribe(eventType: string, cb: (data: any) => void) {
    if (!this.handlers.has(eventType)) this.handlers.set(eventType, new Set());
    this.handlers.get(eventType)!.add(cb);
    if (this.transport) this.transport.send({ type: 'subscribe', eventType });
    else this.ws?.send(JSON.stringify({ type: 'subscribe', eventType }));
    return () => this.unsubscribe(eventType, cb);
  }

  // Optional: subscribe and wait for server acknowledgement
  subscribeWithAck(eventType: string, cb: (data: any) => void, timeoutMs = 3000): { unsubscribe: () => void; ack: Promise<void> } {
    const unsubscribe = this.subscribe(eventType, cb);
    const ack = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingSubs.delete(eventType);
        reject(new Error(`Subscribe ack timeout for ${eventType}`));
      }, timeoutMs);
      this.pendingSubs.set(eventType, (ok) => {
        clearTimeout(timer);
        this.pendingSubs.delete(eventType);
        if (ok) resolve(); else reject(new Error(`Subscribe failed for ${eventType}`));
      });
    });
    return { unsubscribe, ack };
  }

  unsubscribe(eventType: string, cb?: (data: any) => void) {
    if (cb) this.handlers.get(eventType)?.delete(cb);
    if (!cb) this.handlers.delete(eventType);
    if (this.transport) this.transport.send({ type: 'unsubscribe', eventType });
    else this.ws?.send(JSON.stringify({ type: 'unsubscribe', eventType }));
  }

  disconnect() {
    if (this.transport) this.transport.close();
    else this.ws?.close();
    this.transport = null;
  }

  private dispatch(msg: RealtimeEvent) {
    try {
      if (msg.type === 'event' && msg.eventType) {
        const cbs = this.handlers.get(msg.eventType);
        if (cbs) cbs.forEach(cb => cb(msg.data));
      } else if (msg.type === 'success' && (msg as any).data) {
        const data: any = (msg as any).data;
        if (data?.eventType) {
          const resolver = this.pendingSubs.get(data.eventType);
          if (resolver) resolver(true);
        }
      } else if (msg.type === 'error' && (msg as any).error) {
        // If the server responds with an error tied to a subscription, try to infer eventType (optional)
        const data: any = (msg as any).data;
        if (data?.eventType) {
          const resolver = this.pendingSubs.get(data.eventType);
          if (resolver) resolver(false);
        }
      }
    } catch {}
  }
}
