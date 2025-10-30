import express from "express";
import {
  setupTwoFactor,
  verifyTwoFactorCode,
  enableTwoFactor,
  disableTwoFactor,
  getTwoFactorStatus,
  verifyBackupCode,
} from "../controllers/TwoFactorController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// All routes require authentication except backup code verification (used during login)
router.post("/setup", protect, setupTwoFactor);
router.post("/verify", protect, verifyTwoFactorCode);
router.post("/enable", protect, enableTwoFactor);
router.post("/disable", protect, disableTwoFactor);
router.get("/status", protect, getTwoFactorStatus);
router.post("/verify-backup", verifyBackupCode); // No auth needed (used during login)

export default router;
