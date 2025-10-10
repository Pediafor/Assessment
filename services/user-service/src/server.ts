import app from "./app";
import { config } from "dotenv";
import { initializeRabbitMQ } from "./config/rabbitmq";

config(); // load .env

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
