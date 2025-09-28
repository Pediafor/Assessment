import { Router } from "express";
import { issueTokens, refreshAccessToken } from "../services/auth.service";

const router = Router();

// Dummy login (replace with real password check later)
router.post("/login", async (req, res) => {
  const { userId } = req.body;
  try {
    const tokens = await issueTokens(userId);
    res.json(tokens);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const accessToken = await refreshAccessToken(refreshToken);
    res.json({ accessToken });
  } catch (e: any) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

export default router;
