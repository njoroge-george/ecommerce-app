import express from 'express';
const router = express.Router();
import {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController';
import { protect } from '../middlewares/authMiddleware';

// All routes are protected
router.use(protect);

// Get all notifications for current user
router.get('/', getNotifications);

// Create a notification (admin only)
router.post('/', createNotification);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;
