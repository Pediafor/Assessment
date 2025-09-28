import { Router } from "express";

const router = Router();

router.post("/login", (req, res) => {
  res.json({ message: "Login endpoint (dummy)" });
});

export default router;
