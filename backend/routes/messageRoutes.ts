import express from 'express';
const router = express.Router();
import {
  getConversation,
  getConversations,
  sendMessage,
  markAsRead,
  getAllUsers,
} from '../controllers/messageController';
import { protect } from '../middlewares/authMiddleware';

// All routes are protected
router.use(protect);

// Get all conversations for current user
router.get('/conversations', getConversations);

// Get all users (for admin)
router.get('/users', getAllUsers);

// Get conversation with specific user
router.get('/conversation/:userId', getConversation);

// Send a message
router.post('/send', sendMessage);

// Mark messages as read
router.patch('/read/:userId', markAsRead);

export default router;
