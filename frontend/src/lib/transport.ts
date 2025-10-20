export type TransportMessage = any;

export interface ITransport {
  connect(url: string): Promise<void>;
  send(data: TransportMessage): void;
  onMessage(cb: (data: TransportMessage) => void): void;
  close(): void;
}

class WebTransportClient implements ITransport {
  private wt: any | null = null;
  private readerActive = false;
  private onMsg?: (data: any) => void;

  async connect(url: string) {
    // WebTransport requires https and compatible server; feature-detect
    // @ts-ignore
    if (typeof (globalThis as any).WebTransport !== 'function') {
      throw new Error('WebTransport not supported');
    }
    // @ts-ignore
    this.wt = new (globalThis as any).WebTransport(url);
    await this.wt.ready;
    const bidi = await this.wt.createBidirectionalStream();
    const reader = bidi.readable.getReader();
    this.readerActive = true;
    const decoder = new TextDecoder();
    (async () => {
      while (this.readerActive) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        try { this.onMsg?.(JSON.parse(text)); } catch { /* ignore */ }
      }
    })();
    // stash writer for send
    // @ts-ignore
    (this.wt as any)._writer = bidi.writable.getWriter();
  }

  send(data: any) {
    if (!this.wt) return;
    // @ts-ignore
    const writer = (this.wt as any)._writer;
    if (!writer) return;
    const encoder = new TextEncoder();
    const payload = encoder.encode(JSON.stringify(data));
    writer.write(payload);
  }

  onMessage(cb: (data: any) => void) { this.onMsg = cb; }
  close() {
    this.readerActive = false;
    try { this.wt?.close?.(); } catch {}
    this.wt = null;
  }
}

class WebSocketClient implements ITransport {
  private ws: WebSocket | null = null;
  private onMsg?: (data: any) => void;
  connect(url: string) {
    return new Promise<void>((resolve, reject) => {
      try {
        const ws = new WebSocket(url);
        this.ws = ws;
        ws.onopen = () => resolve();
        ws.onmessage = (evt) => {
          try { this.onMsg?.(JSON.parse(evt.data as any)); } catch {}
        };
        ws.onerror = () => reject(new Error('WebSocket error'));
      } catch (e) { reject(e as any); }
    });
  }
  send(data: any) { this.ws?.send(JSON.stringify(data)); }
  onMessage(cb: (data: any) => void) { this.onMsg = cb; }
  close() { try { this.ws?.close(); } catch {}; this.ws = null; }
}

export async function createTransport(primaryUrl: string, fallbackUrl?: string): Promise<ITransport> {
  const wtUrl = primaryUrl;
  const wsUrl = fallbackUrl;
  const wt = new WebTransportClient();
  try {
    await wt.connect(wtUrl);
    return wt;
  } catch {
    const ws = new WebSocketClient();
    await ws.connect(wsUrl || wtUrl.replace('https://', 'wss://').replace('http://', 'ws://'));
    return ws;
  }
}
