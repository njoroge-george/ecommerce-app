import express from 'express';
import {
  getPremiumBenefits,
  checkPremiumStatus,
  grantPremium,
  revokePremium,
  getPremiumUsers,
  subscribeToPremium
} from '../controllers/PremiumController';
import { protect, adminOnly } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/benefits', getPremiumBenefits);

// Protected routes (authenticated users)
router.get('/status', protect, checkPremiumStatus);
router.post('/subscribe', protect, subscribeToPremium);

// Admin only routes
router.post('/grant/:userId', protect, adminOnly, grantPremium);
router.post('/revoke/:userId', protect, adminOnly, revokePremium);
router.get('/users', protect, adminOnly, getPremiumUsers);

export default router;
