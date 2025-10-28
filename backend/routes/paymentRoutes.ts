import express from "express";
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const PaymentController = require("../controllers/PaymentController");

// @route   POST /api/payments/create-intent
// @desc    Create a payment intent
// @access  Authenticated
router.post("/create-intent", protect, PaymentController.createPaymentIntent);

// @route   POST /api/payments/confirm
// @desc    Confirm payment
// @access  Authenticated
router.post("/confirm", protect, PaymentController.confirmPayment);

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhooks
// @access  Public (verified with Stripe signature)
router.post("/webhook", express.raw({ type: 'application/json' }), PaymentController.handleWebhook);

// @route   GET /api/payments/methods
// @desc    Get payment methods
// @access  Authenticated
router.get("/methods", protect, PaymentController.getPaymentMethods);

// @route   POST /api/payments/refund
// @desc    Create a refund
// @access  Admin
router.post("/refund", protect, adminOnly, PaymentController.createRefund);

module.exports = router;
