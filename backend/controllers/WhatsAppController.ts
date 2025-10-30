import type { Request, Response } from "express";

/**
 * @desc    Get WhatsApp business configuration
 * @route   GET /api/whatsapp/config
 * @access  Public
 */
async function getWhatsAppConfig(req: Request, res: Response) {
  try {
    const config = {
      phoneNumber: process.env.WHATSAPP_BUSINESS_NUMBER || "254758960504",
      defaultMessage: process.env.WHATSAPP_DEFAULT_MESSAGE || "Hello! I'm interested in your products.",
      isEnabled: true,
    };

    res.json(config);
  } catch (error: any) {
    console.error("Error getting WhatsApp config:", error);
    res.status(500).json({
      message: "Failed to get WhatsApp configuration",
      error: error.message,
    });
  }
}

// CommonJS export
module.exports = {
  getWhatsAppConfig,
};
