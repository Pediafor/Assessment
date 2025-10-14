import express from "express";
import { issueTokens, refreshAccessToken } from "../services/auth.service";
import { getUserByEmail, updateLastLogin, removeRefreshToken } from "../services/user.service";
import { verifyPassword } from "../utils/hash";

const router = express.Router();

// Login with email and password
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(user.passwordHash, password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    // Issue tokens (only access token returned, refresh token stored in DB)
    const tokens = await issueTokens(user.id);

    // Update last login
    await updateLastLogin(user.id);

    // Set httpOnly cookie with user session for refresh token access
    res.cookie('sessionId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return only access token and user info (without sensitive data)
    const { passwordHash: _, refreshToken: __, ...userInfo } = user;
    
    res.json({
      message: "Login successful",
      user: userInfo,
      accessToken: tokens.accessToken
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal server error"
    });
  }
});

// Refresh access token using httpOnly cookie session
router.post("/refresh", async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      return res.status(401).json({
        error: "No valid session found"
      });
    }

    const tokens = await refreshAccessToken(sessionId);
    res.json(tokens);

  } catch (error: any) {
    console.error("Refresh token error:", error);
    
    if (error.message === "Invalid refresh token") {
      // Clear invalid session cookie
      res.clearCookie('sessionId');
      return res.status(401).json({
        error: "Invalid refresh token"
      });
    }

    res.status(500).json({
      error: "Internal server error"
    });
  }
});

// Logout - invalidate refresh token and clear session
router.post("/logout", async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        error: "No active session found"
      });
    }

    // Remove refresh token from database
    await removeRefreshToken(sessionId);

    // Clear session cookie
    res.clearCookie('sessionId');

    res.json({
      message: "Logout successful"
    });

  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: "Internal server error"
    });
  }
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    await initiatePasswordReset(email);

    // Always return a success message to prevent email enumeration
    res.json({ message: "If a user with that email exists, a password reset link has been sent." });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    const user = await resetPassword(token, newPassword);

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    res.json({ message: "Password reset successful" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify email
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const user = await verifyEmail(token as string);

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    res.json({ message: "Email verified successfully" });

  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;