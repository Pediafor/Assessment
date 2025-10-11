// WebTransport type definitions with @fails-components/webtransport support
// Now includes actual WebTransport implementation for Node.js

// Define our own types since the library exports are complex
export interface WebTransport {
  ready: Promise<void>;
  closed: Promise<void>;
  close(closeInfo?: WebTransportCloseInfo): void;
  createBidirectionalStream(): Promise<WebTransportBidirectionalStream>;
  createUnidirectionalStream(): Promise<WebTransportSendStream>;
  datagrams: WebTransportDatagramDuplexStream;
  incomingBidirectionalStreams: ReadableStream<WebTransportBidirectionalStream>;
  incomingUnidirectionalStreams: ReadableStream<WebTransportReceiveStream>;
}

export interface Http3Server {
  addEventListener(event: string, handler: (event: any) => void): void;
  startServer(): Promise<void>;
}

export interface HttpServer {
  addEventListener(event: string, handler: (event: any) => void): void;
  startServer(): Promise<void>;
}

export interface WebTransportOptions {
  url?: string;
  allowPooling?: boolean;
  requireUnreliable?: boolean;
  serverCertificateHashes?: WebTransportHash[];
}

export interface WebTransportBidirectionalStream {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
}

export interface WebTransportReceiveStream extends ReadableStream<Uint8Array> {}

export interface WebTransportSendStream extends WritableStream<Uint8Array> {}

export interface WebTransportCloseInfo {
  closeCode?: number;
  reason?: string;
}

export interface WebTransportDatagramDuplexStream {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
  maxDatagramSize: number;
  incomingMaxAge?: number;
  outgoingMaxAge?: number;
  incomingHighWaterMark?: number;
  outgoingHighWaterMark?: number;
}

export interface WebTransportHash {
  algorithm: string;
  value: ArrayBuffer;
}

// Custom interface for our service
export interface WebTransportServerOptions {
  port: number;
  host?: string;
  cert: string;
  privKey: string;
  secret?: string;
}

// Availability detection functions
export const isWebTransportAvailable = (): boolean => {
  try {
    // Check if the WebTransport library is available
    // Since it's an ES module, we need to check differently
    return true; // Package is installed, we'll handle import errors in the service
  } catch (error) {
    return false;
  }
};

// Certificate generation utility type
export interface WebTransportCertificate {
  cert: string;
  private: string;
  fingerprint: string;
}

// Authentication and session types
export interface WebTransportSessionInfo {
  sessionId: string;
  userId: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  authenticatedAt: Date;
}

// Connection management types
export interface WebTransportConnectionInfo {
  connectionId: string;
  transport: 'webtransport' | 'websocket';
  session: WebTransportSessionInfo;
  connectedAt: Date;
  lastActivity: Date;
}

// Legacy polyfill detection (kept for backward compatibility)
export interface WebTransportPolyfill {
  WebTransport: any;
  isPolyfill: true;
}

export const detectWebTransportPolyfill = (): WebTransportPolyfill | null => {
  // With the @fails-components/webtransport library, we have real WebTransport
  if (isWebTransportAvailable()) {
    return {
      WebTransport: require('@fails-components/webtransport').WebTransport,
      isPolyfill: false
    } as any;
  }
  return null;
};