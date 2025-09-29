import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "UserService is running! 🚀",
    service: "Pediafor Assessment - UserService",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: {
        login: "POST /auth/login",
        refresh: "POST /auth/refresh", 
        logout: "POST /auth/logout"
      },
      users: {
        register: "POST /users/register",
        profile: "GET /users/:id",
        update: "PUT /users/:id",
        delete: "DELETE /users/:id",
        list: "GET /users"
      }
    }
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "UserService OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.path,
    method: req.method,
    available_endpoints: "Visit GET / for API documentation"
  });
});

export default app;