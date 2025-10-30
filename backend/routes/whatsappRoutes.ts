import express from "express";
const router = express.Router();
import { getWhatsAppConfig } from "../controllers/WhatsAppController";

/**
 * @route   GET /api/whatsapp/config
 * @desc    Get WhatsApp business configuration
 * @access  Public
 */
router.get("/config", getWhatsAppConfig);

export default router;
