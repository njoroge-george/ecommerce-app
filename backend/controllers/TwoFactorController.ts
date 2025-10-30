import { Request, Response } from "express";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import User from "../models/User";
import crypto from "crypto";

// Generate 2FA setup (secret and QR code)
export const setupTwoFactor = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `MyApp (${user.email})`,
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate 10 backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString("hex").toUpperCase()
    );

    // Save secret temporarily (not enabled yet)
    user.twoFactorSecret = secret.base32;
    user.twoFactorBackupCodes = backupCodes;
    await user.save();

    return res.status(200).json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes,
      message: "2FA setup initiated. Please verify the code to enable.",
    });
  } catch (error: any) {
    console.error("Error setting up 2FA:", error);
    return res.status(500).json({ message: "Failed to setup 2FA", error: error.message });
  }
};

// Verify TOTP code
export const verifyTwoFactorCode = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { token } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findByPk(userId);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: "2FA not setup" });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 2, // Allow 2 time steps before/after for clock skew
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid code", verified: false });
    }

    return res.status(200).json({ message: "Code verified", verified: true });
  } catch (error: any) {
    console.error("Error verifying 2FA code:", error);
    return res.status(500).json({ message: "Failed to verify code", error: error.message });
  }
};

// Enable 2FA after verification
export const enableTwoFactor = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { token } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findByPk(userId);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: "2FA not setup" });
    }

    // Verify the token one more time before enabling
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid code. 2FA not enabled." });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    return res.status(200).json({
      message: "Two-factor authentication enabled successfully",
      twoFactorEnabled: true,
      backupCodes: user.twoFactorBackupCodes,
    });
  } catch (error: any) {
    console.error("Error enabling 2FA:", error);
    return res.status(500).json({ message: "Failed to enable 2FA", error: error.message });
  }
};

// Disable 2FA
export const disableTwoFactor = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required to disable 2FA" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password (you may need to import bcrypt)
    const bcrypt = require("bcrypt");
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorBackupCodes = null;
    await user.save();

    return res.status(200).json({
      message: "Two-factor authentication disabled successfully",
      twoFactorEnabled: false,
    });
  } catch (error: any) {
    console.error("Error disabling 2FA:", error);
    return res.status(500).json({ message: "Failed to disable 2FA", error: error.message });
  }
};

// Get 2FA status
export const getTwoFactorStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      twoFactorEnabled: user.twoFactorEnabled,
      hasSecret: !!user.twoFactorSecret,
    });
  } catch (error: any) {
    console.error("Error getting 2FA status:", error);
    return res.status(500).json({ message: "Failed to get 2FA status", error: error.message });
  }
};

// Verify backup code
export const verifyBackupCode = async (req: Request, res: Response) => {
  try {
    const { email, backupCode } = req.body;

    if (!email || !backupCode) {
      return res.status(400).json({ message: "Email and backup code are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.twoFactorEnabled || !user.twoFactorBackupCodes) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Check if backup code exists
    const codeIndex = user.twoFactorBackupCodes.indexOf(backupCode.toUpperCase());
    if (codeIndex === -1) {
      return res.status(400).json({ message: "Invalid backup code" });
    }

    // Remove used backup code
    const updatedBackupCodes = [...user.twoFactorBackupCodes];
    updatedBackupCodes.splice(codeIndex, 1);
    user.twoFactorBackupCodes = updatedBackupCodes;
    await user.save();

    return res.status(200).json({
      message: "Backup code verified",
      verified: true,
      remainingCodes: updatedBackupCodes.length,
    });
  } catch (error: any) {
    console.error("Error verifying backup code:", error);
    return res.status(500).json({ message: "Failed to verify backup code", error: error.message });
  }
};
