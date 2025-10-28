import express from "express";
import { getAnalytics } from "../controllers/analyticsController";
import { protect, adminOnly } from "../middlewares/authMiddleware";

const router = express.Router();

// Admin-only analytics route
router.get("/", protect, adminOnly, getAnalytics);

export default router;
