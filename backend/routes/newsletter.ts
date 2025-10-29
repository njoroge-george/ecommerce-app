import express from 'express';
import { 
  subscribe, 
  unsubscribe, 
  getAllSubscribers, 
  getSubscriberStats,
  deleteSubscriber 
} from '../controllers/NewsletterController';
import { protect, adminOnly } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

// Admin routes
router.get('/subscribers', protect, adminOnly, getAllSubscribers);
router.get('/stats', protect, adminOnly, getSubscriberStats);
router.delete('/subscribers/:email', protect, adminOnly, deleteSubscriber);

export default router;
