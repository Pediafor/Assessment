import express from "express";

const app = express();
app.use(express.json());

// Root route - what you see at localhost:4000
app.get("/", (req, res) => {
  res.json({ 
    message: "UserService is running! 🚀",
    service: "Pediafor Assessment - UserService",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/auth/login, /auth/refresh", 
      users: "/users"
    }
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "UserService OK" });
});

export default app;
