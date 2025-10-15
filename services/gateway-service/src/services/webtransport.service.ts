import WebSocket from 'ws';
import { Server as HTTPServer } from 'http';
import { UserContext, WebSocketAuth } from '../middleware/websocket.auth';
import { EventSubscriber } from '../config/rabbitmq';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Dynamic imports for optional WebTransport support
let WebTransportTypes: any = null;
let generateWebTransportCertificate: any = null;

// Try to load WebTransport dependencies
try {
  WebTransportTypes = require('../types/webtransport');
  const certUtils = require('../utils/certificate');
  generateWebTransportCertificate = certUtils.generateWebTransportCertificate;
} catch (error) {
  console.log('📝 WebTransport dependencies not available, running in WebSocket-only mode');
}

export interface RealtimeMessage {
  type: 'event' | 'authenticate' | 'subscribe' | 'unsubscribe' | 'error' | 'success';
  eventType?: string;
  data?: unknown;
  timestamp?: number;
  userId?: string;
  error?: string;
}

export interface ClientConnection {
  id: string;
  userId: string;
  userContext: UserContext;
  transport: 'webtransport' | 'websocket';
  connection: any; // WebTransport session or WebSocket
  subscriptions: Set<string>;
  lastPing: number;
  createdAt: number;
}

export interface EventFilter {
  eventType: string;
  targetUsers?: string[];
  targetRoles?: Array<'STUDENT' | 'TEACHER' | 'ADMIN'>;
  conditions?: Record<string, unknown>;
}

export class WebTransportRealtimeService {
  private clients = new Map<string, ClientConnection>();
  private eventSubscriber: EventSubscriber | null = null;
  private webTransportServer: any = null; // Generic type to handle optional WebTransport
  private websocketServer: WebSocket.Server | null = null;
  private readonly pingInterval = 30000; // 30 seconds
  private pingTimer: NodeJS.Timeout | null = null;
  private certificate: any = null; // Generic type for certificate

  constructor(
    private readonly port: number = 8080,
    private readonly enableWebTransport: boolean = true,
    private readonly enableWebSocket: boolean = true,
    private readonly httpServer?: HTTPServer
  ) {}

  async start(): Promise<void> {
    console.log('🚀 Starting WebTransport Realtime Service...');

    // Initialize event subscriber (optional for development)
    try {
      this.eventSubscriber = new EventSubscriber();
      await this.eventSubscriber.connect();
      console.log('✅ Connected to RabbitMQ event system');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('⚠️ Failed to connect to RabbitMQ:', errorMessage);
      console.log('📝 Continuing without RabbitMQ (development mode)');
      this.eventSubscriber = null;
    }

    // Start WebTransport server if available and enabled
    if (this.enableWebTransport) {
      try {
        await this.startWebTransportServer();
      } catch (error) {
        console.warn('⚠️ WebTransport server failed to start:', error);
        console.log('📝 WebTransport may not be available in this Node.js version');
      }
    }

    // Start WebSocket server as fallback/legacy support
    if (this.enableWebSocket) {
      await this.startWebSocketServer();
    }

    if (!this.webTransportServer && !this.websocketServer) {
      throw new Error('No transport protocols available - service cannot start');
    }

    // Subscribe to all events from backend services (if RabbitMQ is available)
    if (this.eventSubscriber) {
      await this.subscribeToEvents();
    } else {
      console.log('📝 Skipping event subscription (no RabbitMQ connection)');
    }

    // Start ping/keepalive mechanism
    this.startPingInterval();

    console.log(`🎯 Realtime service running on port ${this.port}`);
    console.log(`📡 WebTransport: ${this.webTransportServer ? '✅ Active' : '❌ Unavailable'}`);
    console.log(`🔌 WebSocket: ${this.websocketServer ? '✅ Active (Legacy)' : '❌ Disabled'}`);
  }

  private async startWebTransportServer(): Promise<void> {
    try {
      console.log('🚀 Starting real WebTransport server...');
      
      // Load or generate certificate
      await this.loadOrGenerateCertificate();
      
      if (!this.certificate) {
        throw new Error('Failed to load or generate certificate');
      }

      console.log(`🔑 Certificate fingerprint: ${this.certificate.fingerprint}`);

      // Import the WebTransport library and get HttpServer
      const modulePath = '@fails-components/webtransport';
      const WebTransportLib = await eval(`import('${modulePath}')`);
      
      const { HttpServer } = WebTransportLib;
      console.log('� WebTransport library loaded successfully');

      // Create WebTransport server (HTTP/3 + HTTP/2 support)
      this.webTransportServer = new HttpServer({
        port: this.port + 1, // Use different port for WebTransport (8081)
        host: '0.0.0.0',
        secret: process.env.WEBTRANSPORT_SECRET || 'assessment-platform-secret',
        cert: this.certificate.cert,
        privKey: this.certificate.private,
        defaultDatagramsReadableMode: 'bytes' // Required property
      });

      // Handle WebTransport connections using the correct API
      (this.webTransportServer as any).onSessionRequest = (sessionRequest: any) => {
        console.log('🔌 New WebTransport session connected');
        this.handleWebTransportSession(sessionRequest);
      };

      // Start the WebTransport server
      await (this.webTransportServer as any).startServer();
      console.log('✅ WebTransport server started successfully on port', this.port + 1);

    } catch (error) {
      console.warn('⚠️ WebTransport server failed to start:', error);
      console.log('📝 Falling back to WebSocket-only mode');
      this.webTransportServer = null;
    }
  }

  private async loadOrGenerateCertificate(): Promise<void> {
    const certPath = join(process.cwd(), 'webtransport-cert.json');
    
    // Try to load existing certificate
    if (existsSync(certPath)) {
      try {
        const certData = JSON.parse(readFileSync(certPath, 'utf8'));
        this.certificate = certData;
        console.log('� Loaded existing WebTransport certificate');
        return;
      } catch (error) {
        console.log('⚠️ Failed to load existing certificate, generating new one');
      }
    }

    // Generate new certificate
    console.log('🔧 Generating new WebTransport certificate...');
    this.certificate = await generateWebTransportCertificate({
      days: 14, // Short-lived for security
      hostname: 'localhost'
    });

    // Save certificate for reuse
    try {
      writeFileSync(certPath, JSON.stringify(this.certificate, null, 2));
      console.log('💾 Certificate saved for future use');
    } catch (error) {
      console.warn('⚠️ Failed to save certificate:', error);
    }
  }

  private handleWebTransportSession(session: any): void {
    const connectionId = `wt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`� WebTransport session ${connectionId} connected`);

    // Handle incoming streams
    session.incomingUnidirectionalStreams.getReader().read().then((result: any) => {
      if (!result.done) {
        const stream = result.value;
        this.handleWebTransportStream(connectionId, stream);
      }
    });

    // Handle datagrams
    session.datagrams.readable.getReader().read().then((result: any) => {
      if (!result.done) {
        const data = result.value;
        this.handleWebTransportDatagram(connectionId, data);
      }
    });

    // Store session info (simplified for now)
    const clientConnection: ClientConnection = {
      id: connectionId,
      userId: 'anonymous', // Will be set after authentication
      userContext: { id: 'anonymous', role: 'STUDENT' } as UserContext,
      transport: 'webtransport',
      connection: session,
      subscriptions: new Set(),
      lastPing: Date.now(),
      createdAt: Date.now()
    };

    this.clients.set(connectionId, clientConnection);

    // Handle session closure
    session.closed.then(() => {
      console.log(`🔗 WebTransport session ${connectionId} closed`);
      this.clients.delete(connectionId);
    });
  }

  private handleWebTransportStream(connectionId: string, stream: any): void {
    console.log(`📡 WebTransport stream from ${connectionId}`);
    // Handle stream data here
  }

  private handleWebTransportDatagram(connectionId: string, data: Uint8Array): void {
    console.log(`📡 WebTransport datagram from ${connectionId}:`, data);
    // Handle datagram data here
  }

  private prepareWebTransportInfrastructure(): void {
    // Prepare WebTransport handling infrastructure
    console.log('🏗️ Preparing WebTransport infrastructure...');
    
    // This method prepares the service for WebTransport connections
    // when they become available in the Node.js ecosystem
    
    // Event handlers and connection management will be added here
    // when WebTransport server APIs become available
  }

  private async startWebSocketServer(): Promise<void> {
    console.log('🔌 Starting WebSocket server (Legacy Support)...');

    const serverOptions: WebSocket.ServerOptions = {
      path: '/realtime',
      verifyClient: this.verifyWebSocketClient.bind(this)
    };

    // Use existing HTTP server if provided, otherwise create new server on port
    if (this.httpServer) {
      serverOptions.server = this.httpServer;
    } else {
      serverOptions.port = this.port;
    }

    this.websocketServer = new WebSocket.Server(serverOptions);

    this.websocketServer.on('connection', (ws: WebSocket, request) => {
      this.handleWebSocketConnection(ws, request);
    });

    this.websocketServer.on('error', (error) => {
      console.error('❌ WebSocket server error:', error);
    });

    console.log('✅ WebSocket server started successfully');
  }

  private verifyWebSocketClient(info: { origin: string; secure: boolean; req: unknown }): boolean {
    // Basic origin verification
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    if (process.env.NODE_ENV === 'development') {
      return true; // Allow all in development
    }

    return allowedOrigins.includes(info.origin);
  }

  private async handleWebSocketConnection(ws: WebSocket, request: unknown): Promise<void> {
    const clientId = this.generateClientId();
    console.log(`🔗 New WebSocket connection: ${clientId}`);

    // Extract token from URL or wait for authentication message
    let userContext: UserContext | null = null;
    const requestObj = request as { url?: string };
    const tokenFromUrl = WebSocketAuth.extractTokenFromUrl(requestObj.url || '');
    
    if (tokenFromUrl) {
      userContext = await WebSocketAuth.validateToken(tokenFromUrl);
    }

    // Create preliminary client connection
    const clientConnection: ClientConnection = {
      id: clientId,
      userId: userContext?.id || 'unauthenticated',
      userContext: userContext || WebSocketAuth.createMockUserContext(),
      transport: 'websocket',
      connection: ws,
      subscriptions: new Set(),
      lastPing: Date.now(),
      createdAt: Date.now()
    };

    // Handle messages
    ws.on('message', async (data: Buffer) => {
      try {
        const message: RealtimeMessage = JSON.parse(data.toString());
        await this.handleClientMessage(clientConnection, message);
      } catch (error) {
        console.error(`❌ Error handling WebSocket message from ${clientId}:`, error);
        this.sendErrorToClient(clientConnection, 'Invalid message format');
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      console.log(`🔌 WebSocket client disconnected: ${clientId}`);
      this.clients.delete(clientId);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`❌ WebSocket client error ${clientId}:`, error);
      this.clients.delete(clientId);
    });

    // Store client connection if authenticated
    if (userContext) {
      this.clients.set(clientId, clientConnection);
      this.sendSuccessToClient(clientConnection, 'Connected successfully');
    } else {
      // Send authentication required message
      this.sendErrorToClient(clientConnection, 'Authentication required');
    }
  }

  private async handleClientMessage(client: ClientConnection, message: RealtimeMessage): Promise<void> {
    switch (message.type) {
      case 'authenticate':
        await this.handleAuthentication(client, message);
        break;
      
      case 'subscribe':
        await this.handleSubscription(client, message);
        break;
      
      case 'unsubscribe':
        await this.handleUnsubscription(client, message);
        break;
      
      default:
        console.warn(`⚠️ Unknown message type: ${message.type}`);
        this.sendErrorToClient(client, `Unknown message type: ${message.type}`);
    }
  }

  private async handleAuthentication(client: ClientConnection, message: RealtimeMessage): Promise<void> {
    const token = WebSocketAuth.extractTokenFromMessage(message);
    
    if (!token) {
      this.sendErrorToClient(client, 'Token required for authentication');
      return;
    }

    const userContext = await WebSocketAuth.validateToken(token);
    
    if (!userContext) {
      this.sendErrorToClient(client, 'Invalid or expired token');
      return;
    }

    // Update client with authenticated user context
    client.userContext = userContext;
    client.userId = userContext.id;
    
    // Store authenticated client
    this.clients.set(client.id, client);
    
    this.sendSuccessToClient(client, 'Authentication successful');
    console.log(`✅ Client ${client.id} authenticated as ${userContext.email}`);
  }

  private async handleSubscription(client: ClientConnection, message: RealtimeMessage): Promise<void> {
    if (!message.eventType) {
      this.sendErrorToClient(client, 'Event type required for subscription');
      return;
    }

    client.subscriptions.add(message.eventType);
    this.sendSuccessToClient(client, `Subscribed to ${message.eventType}`);
    console.log(`📡 Client ${client.id} subscribed to ${message.eventType}`);
  }

  private async handleUnsubscription(client: ClientConnection, message: RealtimeMessage): Promise<void> {
    if (!message.eventType) {
      this.sendErrorToClient(client, 'Event type required for unsubscription');
      return;
    }

    client.subscriptions.delete(message.eventType);
    this.sendSuccessToClient(client, `Unsubscribed from ${message.eventType}`);
    console.log(`📡 Client ${client.id} unsubscribed from ${message.eventType}`);
  }

  private async subscribeToEvents(): Promise<void> {
    if (!this.eventSubscriber) {
      throw new Error('Event subscriber not initialized');
    }

    // Subscribe to all event types from backend services
    const eventTypes = [
      // user
      'user.created', 'user.updated', 'user.deleted',
      // assessment lifecycle
      'assessment.created', 'assessment.updated', 'assessment.deleted', 'assessment.published',
      // submission lifecycle
      'submission.created', 'submission.updated', 'submission.submitted', 'submission.graded',
      // grading
      'grading.completed', 'grading.failed', 'grading.feedback.updated',
      // notifications
      'notification.created'
    ];

    for (const eventType of eventTypes) {
      await this.eventSubscriber.subscribe(eventType, (eventData: unknown) => {
        this.broadcastEvent(eventType, eventData);
      });
    }

    console.log(`✅ Subscribed to ${eventTypes.length} event types`);
  }

  private broadcastEvent(eventType: string, eventData: unknown): void {
    const message: RealtimeMessage = {
      type: 'event',
      eventType,
      data: eventData,
      timestamp: Date.now()
    };

    // Filter and send to relevant clients
    const relevantClients = this.filterClientsForEvent(eventType, eventData);
    
    for (const client of relevantClients) {
      this.sendMessageToClient(client, message);
    }

    console.log(`📢 Broadcasted ${eventType} to ${relevantClients.length} clients`);
  }

  private filterClientsForEvent(eventType: string, eventData: unknown): ClientConnection[] {
    const relevantClients: ClientConnection[] = [];

    for (const client of this.clients.values()) {
      // Check if client is subscribed to this event type
      if (!client.subscriptions.has(eventType)) {
        continue;
      }

      // Apply event-specific filtering logic
      if (this.shouldReceiveEvent(client, eventType, eventData)) {
        relevantClients.push(client);
      }
    }

    return relevantClients;
  }

  private shouldReceiveEvent(client: ClientConnection, eventType: string, eventData: unknown): boolean {
    // Implement event filtering logic based on user context and event data
    const { userContext } = client;

    // Type guard for event data
    const data = eventData as Record<string, unknown>;

    switch (eventType) {
      case 'assessment.created':
      case 'assessment.updated':
      case 'assessment.published':
        // Teachers see all assessments, students see only published ones for their courses
        if (userContext.role === 'TEACHER' || userContext.role === 'ADMIN') {
          return true;
        }
        return data.status === 'PUBLISHED' && this.isUserInCourse(userContext.id, data.courseId as string);

      case 'submission.created':
      case 'submission.updated':
        // Users see only their own submissions, teachers see all for their assessments
        if (data.userId === userContext.id) {
          return true;
        }
        if (userContext.role === 'TEACHER' || userContext.role === 'ADMIN') {
          return this.isTeacherOfAssessment(userContext.id, data.assessmentId as string);
        }
        return false;

      case 'grade.updated':
        // Users see only their own grades, teachers see grades they assigned
        if (data.userId === userContext.id) {
          return true;
        }
        if (userContext.role === 'TEACHER' || userContext.role === 'ADMIN') {
          return this.isTeacherOfAssessment(userContext.id, data.assessmentId as string);
        }
        return false;

      case 'notification.created':
        // Users see only their own notifications
        return data.userId === userContext.id;

      default:
        // By default, admin sees everything, others see events related to them
        if (userContext.role === 'ADMIN') {
          return true;
        }
        return data.userId === userContext.id;
    }
  }

  private isUserInCourse(userId: string, courseId: string): boolean {
    // Tightened placeholder: deny when missing identifiers
    if (!userId || !courseId) return false;
    // TODO: Integrate with user-service/course membership
    return true;
  }

  private isTeacherOfAssessment(teacherId: string, assessmentId: string): boolean {
    // Tightened placeholder: deny when missing identifiers
    if (!teacherId || !assessmentId) return false;
    // TODO: Integrate with assessment-service for ownership
    return true;
  }

  private sendMessageToClient(client: ClientConnection, message: RealtimeMessage): void {
    try {
      const messageString = JSON.stringify(message);

      if (client.transport === 'websocket') {
        const ws = client.connection as WebSocket;
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageString);
        } else {
          console.warn(`⚠️ WebSocket client ${client.id} not ready for message`);
        }
      } else if (client.transport === 'webtransport') {
        // Attempt to send using unidirectional streams or datagrams when available
        const session: any = client.connection;
        try {
          if (session?.createUnidirectionalStream) {
            (async () => {
              const stream = await session.createUnidirectionalStream();
              const writer = stream.getWriter();
              const encoder = new TextEncoder();
              await writer.write(encoder.encode(messageString));
              await writer.close();
            })().catch((e: any) => console.warn(`⚠️ WebTransport stream send failed for ${client.id}:`, e));
          } else if (session?.datagrams?.writable) {
            const writer = session.datagrams.writable.getWriter();
            const encoder = new TextEncoder();
            writer.write(encoder.encode(messageString)).finally(() => writer.releaseLock());
          } else {
            console.log(`📡 WebTransport session not writable for ${client.id}`);
          }
        } catch (e) {
          console.warn(`⚠️ WebTransport send not supported in current runtime for ${client.id}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error sending message to client ${client.id}:`, error);
    }
  }

  private sendSuccessToClient(client: ClientConnection, message: string): void {
    this.sendMessageToClient(client, {
      type: 'success',
      data: { message },
      timestamp: Date.now()
    });
  }

  private sendErrorToClient(client: ClientConnection, error: string): void {
    this.sendMessageToClient(client, {
      type: 'error',
      error,
      timestamp: Date.now()
    });
  }

  private startPingInterval(): void {
    this.pingTimer = setInterval(() => {
      this.pingClients();
    }, this.pingInterval);
  }

  private pingClients(): void {
    const now = Date.now();
    const staleConnections: string[] = [];

    for (const [clientId, client] of this.clients.entries()) {
      if (client.transport === 'websocket') {
        const ws = client.connection as WebSocket;
        
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.ping();
            client.lastPing = now;
          } catch (error) {
            console.warn(`⚠️ Failed to ping WebSocket client ${clientId}`);
            staleConnections.push(clientId);
          }
        } else {
          staleConnections.push(clientId);
        }
      }
      
      // Check for stale connections (no response for 2 ping intervals)
      if (now - client.lastPing > this.pingInterval * 2) {
        staleConnections.push(clientId);
      }
    }

    // Clean up stale connections
    for (const clientId of staleConnections) {
      console.log(`🧹 Removing stale connection: ${clientId}`);
      this.clients.delete(clientId);
    }

    if (this.clients.size > 0) {
      console.log(`💓 Pinged ${this.clients.size} active clients`);
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping WebTransport Realtime Service...');

    // Stop ping timer
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }

    // Close all client connections
    for (const client of this.clients.values()) {
      if (client.transport === 'websocket') {
        const ws = client.connection as WebSocket;
        ws.close();
      }
    }
    this.clients.clear();

    // Close WebSocket server
    if (this.websocketServer) {
      this.websocketServer.close();
      this.websocketServer = null;
    }

    // Close WebTransport server when available
    if (this.webTransportServer) {
      // TODO: Implement WebTransport server close when available
      this.webTransportServer = null;
    }

    // Disconnect from RabbitMQ
    if (this.eventSubscriber) {
      await this.eventSubscriber.disconnect();
      this.eventSubscriber = null;
    }

    console.log('✅ WebTransport Realtime Service stopped');
  }

  // Public API for service status
  getStatus(): { 
    clientCount: number; 
    transports: string[]; 
    uptime: number;
    webTransportSupported: boolean;
  } {
    const webTransportSupported = WebTransportTypes && generateWebTransportCertificate ? true : false;
    
    return {
      clientCount: this.clients.size,
      transports: [
        ...(this.webTransportServer ? ['webtransport'] : []),
        ...(this.websocketServer ? ['websocket'] : [])
      ],
      uptime: process.uptime(),
      webTransportSupported
    };
  }

  getConnectedClients(): Array<{
    id: string;
    userId: string;
    transport: string;
    subscriptions: string[];
    connectedAt: number;
  }> {
    return Array.from(this.clients.values()).map(client => ({
      id: client.id,
      userId: client.userId,
      transport: client.transport,
      subscriptions: Array.from(client.subscriptions),
      connectedAt: client.createdAt
    }));
  }
}