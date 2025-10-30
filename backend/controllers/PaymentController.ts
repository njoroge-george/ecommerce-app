import type { Request, Response } from "express";
import Stripe from "stripe";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware";
import Order from "../models/Order";

// Stripe Configuration
const stripeConfig = {
  useMockMode: process.env.STRIPE_MOCK_MODE === 'true' || !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key',
};

// Initialize Stripe (only if not in mock mode)
const stripe = stripeConfig.useMockMode 
  ? null 
  : new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-12-18.acacia',
    });

/**
 * @desc    Create a payment intent (with mock mode support)
 * @route   POST /api/payments/create-intent
 * @access  Authenticated
 */
async function createPaymentIntent(req: AuthenticatedRequest, res: Response) {
  try {
    const { amount, currency = 'usd', orderNumber } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // MOCK MODE: Simulate Stripe payment intent without real API
    if (stripeConfig.useMockMode) {
      console.log('🧪 MOCK STRIPE: Creating payment intent');
      console.log(`💰 Amount: ${amount} ${currency.toUpperCase()}`);
      console.log(`📦 Order: ${orderNumber}`);

      const mockPaymentIntentId = `pi_mock_${Date.now()}${Math.random().toString(36).substring(7)}`;
      const mockClientSecret = `${mockPaymentIntentId}_secret_${Math.random().toString(36).substring(7)}`;

      // Simulate payment success after 2 seconds
      setTimeout(async () => {
        console.log('🧪 MOCK STRIPE: Simulating successful card payment');
        
        try {
          const order = await Order.findOne({ where: { orderNumber } });
          
          if (order) {
            await order.update({
              paymentStatus: 'completed',
              status: 'confirmed',
              paymentMethod: 'card',
            });
            console.log(`✅ MOCK STRIPE: Payment completed for order ${orderNumber}`);
          }
        } catch (error) {
          console.error('❌ MOCK STRIPE: Error updating order:', error);
        }
      }, 2000);

      return res.json({
        clientSecret: mockClientSecret,
        paymentIntentId: mockPaymentIntentId,
        mockMode: true,
        message: 'Mock payment intent created successfully',
      });
    }

    // REAL API MODE
    if (!stripe) {
      return res.status(500).json({ message: "Stripe not configured" });
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
}

/**
 * @desc    Confirm payment (with mock mode support)
 * @route   POST /api/payments/confirm
 * @access  Authenticated
 */
async function confirmPayment(req: AuthenticatedRequest, res: Response) {
  try {
    const { paymentIntentId, orderNumber } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment intent ID is required" });
    }

    // MOCK MODE: Return mock success response
    if (stripeConfig.useMockMode) {
      console.log('🧪 MOCK STRIPE: Confirming payment for:', paymentIntentId);
      
      const order = await Order.findOne({ where: { orderNumber } });
      
      if (order && order.paymentStatus === 'completed') {
        console.log('✅ MOCK STRIPE: Payment confirmed');
        return res.json({
          status: 'succeeded',
          amount: order.total,
          currency: 'usd',
          paymentMethod: 'card_mock',
          mockMode: true,
        });
      } else {
        console.log('⏳ MOCK STRIPE: Payment still processing');
        return res.json({
          status: 'processing',
          amount: order?.total || 0,
          currency: 'usd',
          mockMode: true,
        });
      }
    }

    // REAL API MODE
    if (!stripe) {
      return res.status(500).json({ message: "Stripe not configured" });
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
}

/**
 * @desc    Handle Stripe webhooks
 * @route   POST /api/payments/webhook
 * @access  Public (but verified with Stripe signature)
 */
async function handleWebhook(req: Request, res: Response) {
  // In mock mode, webhooks are simulated automatically
  if (stripeConfig.useMockMode) {
    console.log('🧪 MOCK STRIPE: Webhook received (simulated)');
    return res.json({ received: true, mockMode: true });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).json({ message: "Missing signature or webhook secret" });
  }

  if (!stripe) {
    return res.status(500).json({ message: "Stripe not configured" });
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
}

/**
 * @desc    Get payment methods for a customer
 * @route   GET /api/payments/methods
 * @access  Authenticated
 */
async function getPaymentMethods(req: AuthenticatedRequest, res: Response) {
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
}

/**
 * @desc    Create a refund
 * @route   POST /api/payments/refund
 * @access  Admin
 */
async function createRefund(req: Request, res: Response) {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment intent ID is required" });
    }

    // MOCK MODE: Simulate refund
    if (stripeConfig.useMockMode) {
      console.log('🧪 MOCK STRIPE: Creating refund');
      console.log(`💰 Amount: ${amount || 'Full refund'}`);
      console.log(`📝 Reason: ${reason || 'None provided'}`);
      
      const mockRefundId = `re_mock_${Date.now()}${Math.random().toString(36).substring(7)}`;
      
      return res.json({
        refundId: mockRefundId,
        status: 'succeeded',
        amount: amount || 0,
        mockMode: true,
      });
    }

    if (!stripe) {
      return res.status(500).json({ message: "Stripe not configured" });
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
}

// CommonJS exports for compatibility
module.exports = {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentMethods,
  createRefund,
};
