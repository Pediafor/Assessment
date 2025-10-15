import { WebTransportRealtimeService } from './services/webtransport.service';
import express from 'express';
import { createServer } from 'http';

async function startRealtimeServer() {
  console.log('🚀 Starting Assessment Platform Realtime Server');
  console.log('📋 Features: WebTransport (prepared) + WebSocket (active)');
  console.log('📦 Exchanges:', process.env.RABBITMQ_EXCHANGES || 'assessment.events,submission.events,grading.events');
  
  try {
    // Create Express app for health checks
    const app = express();
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        service: 'realtime-server',
        timestamp: new Date().toISOString(),
        websocket: true,
        webtransport: 'prepared'
      });
    });

    const port = parseInt(process.env.PORT || process.env.REALTIME_PORT || '8080');
    
    // Create HTTP server
    const httpServer = createServer(app);
    
    const realtimeService = new WebTransportRealtimeService(
      port,
      true,  // Enable WebTransport (prepared for future)
      true,  // Enable WebSocket (active legacy support)
      httpServer // Pass HTTP server for WebSocket to attach to
    );

    await realtimeService.start();
    
    // Start HTTP server
    httpServer.listen(port, () => {
      console.log('✅ Realtime server started successfully');
      console.log(`🌐 WebSocket server: ws://localhost:${port}/realtime`);
      console.log(`🏥 Health endpoint: http://localhost:${port}/health`);
      console.log('📡 WebTransport: Infrastructure prepared for future Node.js support');
    });
    
    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('📝 Shutting down gracefully...');
      await realtimeService.stop();
      httpServer.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // Log status every 30 seconds
    setInterval(() => {
      const status = realtimeService.getStatus();
      console.log(`💡 Status: ${status.clientCount} clients, ${status.transports.join(', ')}, uptime: ${Math.floor(status.uptime)}s`);
    }, 30000);

  } catch (error) {
    console.error('❌ Failed to start realtime server:', error);
    process.exit(1);
  }
}

// Start the server
startRealtimeServer().catch((error) => {
  console.error('💥 Fatal error starting realtime server:', error);
  process.exit(1);
});