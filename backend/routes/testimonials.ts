import express from 'express';
import {
  submitTestimonial,
  getApprovedTestimonials,
  getAllTestimonials,
  approveTestimonial,
  deleteTestimonial,
  toggleVisibility,
  getPendingCount,
} from '../controllers/TestimonialController';
import { protect, adminOnly } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.post('/submit', submitTestimonial); // Anyone can submit
router.get('/approved', getApprovedTestimonials); // Get approved testimonials

// Admin routes
router.get('/all', protect, adminOnly, getAllTestimonials);
router.patch('/:id/approve', protect, adminOnly, approveTestimonial);
router.delete('/:id', protect, adminOnly, deleteTestimonial);
router.patch('/:id/toggle-visibility', protect, adminOnly, toggleVisibility);
router.get('/pending/count', protect, adminOnly, getPendingCount);

export default router;
