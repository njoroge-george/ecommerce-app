import type { Request, Response } from "express";
import Stripe from "stripe";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

/**
 * @desc    Create a payment intent
 * @route   POST /api/payments/create-intent
 * @access  Authenticated
 */
export const createPaymentIntent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, currency = 'usd', orderNumber } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        orderNumber: orderNumber || '',
        userId: req.user?.id?.toString() || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ 
      message: "Failed to create payment intent",
      error: error.message 
    });
  }
};

/**
 * @desc    Confirm payment
 * @route   POST /api/payments/confirm
 * @access  Authenticated
 */
export const confirmPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment intent ID is required" });
    }

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert back to dollars
      currency: paymentIntent.currency,
      paymentMethod: paymentIntent.payment_method,
    });
  } catch (error: any) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ 
      message: "Failed to confirm payment",
      error: error.message 
    });
  }
};

/**
 * @desc    Handle Stripe webhooks
 * @route   POST /api/payments/webhook
 * @access  Public (but verified with Stripe signature)
 */
export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).json({ message: "Missing signature or webhook secret" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
      // Update order status to confirmed
      // This would typically update your database
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log(`❌ Payment failed: ${failedPayment.id}`);
      // Handle failed payment
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

/**
 * @desc    Get payment methods for a customer
 * @route   GET /api/payments/methods
 * @access  Authenticated
 */
export const getPaymentMethods = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // In a real app, you'd store customer IDs in your database
    // For now, return empty array
    res.json({ paymentMethods: [] });
  } catch (error: any) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ 
      message: "Failed to fetch payment methods",
      error: error.message 
    });
  }
};

/**
 * @desc    Create a refund
 * @route   POST /api/payments/refund
 * @access  Admin
 */
export const createRefund = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment intent ID is required" });
    }

    const refundData: any = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    if (reason) {
      refundData.reason = reason;
    }

    const refund = await stripe.refunds.create(refundData);

    res.json({
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
    });
  } catch (error: any) {
    console.error("Error creating refund:", error);
    res.status(500).json({ 
      message: "Failed to create refund",
      error: error.message 
    });
  }
};

// CommonJS exports for compatibility
module.exports = {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentMethods,
  createRefund,
};
