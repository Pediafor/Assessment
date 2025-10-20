// Load environment variables before importing anything that might read them
import { config } from "dotenv";
config(); // load .env early

import app from "./app";
import { initializeRabbitMQ } from "./config/rabbitmq";

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Initialize RabbitMQ connection
    await initializeRabbitMQ();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 UserService running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start UserService:', error);
    process.exit(1);
  }
}

startServer();
