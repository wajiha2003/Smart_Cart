import { Router } from "express";
import { generateProductContent, recommendations, chat } from "../controllers/aiController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.post("/generate", requireAuth, requireAdmin, generateProductContent);

// Any logged-in user
router.post("/recommendations", requireAuth, recommendations);
router.post("/chat", requireAuth, chat);

export default router;