const express = require('express');
const {
  validateCoupon,
  applyCoupon,
  getAllCoupons,
  getActiveCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/CouponController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/validate', validateCoupon);
router.get('/active', getActiveCoupons);

// Protected routes
router.post('/apply', protect, applyCoupon);

// Admin routes
router.get('/', protect, adminOnly, getAllCoupons);
router.post('/', protect, adminOnly, createCoupon);
router.patch('/:id', protect, adminOnly, updateCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);

module.exports = router;
