import type { Response } from "express";
import axios from "axios";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware";
import Order from "../models/Order";

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passkey: string;
  callbackUrl: string;
  environment: 'sandbox' | 'production';
}

// M-Pesa Configuration
const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || '',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
  shortCode: process.env.MPESA_SHORTCODE || '174379',
  passkey: process.env.MPESA_PASSKEY || '',
  callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/mpesa/callback',
  environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  useMockMode: process.env.MPESA_MOCK_MODE === 'true' || true, // Enable mock mode by default
};

// Get M-Pesa access token
const getMpesaToken = async (): Promise<string> => {
  const auth = Buffer.from(
    `${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`
  ).toString('base64');

  const baseUrl = mpesaConfig.environment === 'sandbox'
    ? 'https://sandbox.safaricom.co.ke'
    : 'https://api.safaricom.co.ke';

  try {
    const response = await axios.get(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error: any) {
    console.error('Error getting M-Pesa token:', error.response?.data || error.message);
    throw new Error('Failed to get M-Pesa access token');
  }
};

// Generate timestamp in required format (YYYYMMDDHHmmss)
const getTimestamp = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

// Generate password for M-Pesa
const generatePassword = (timestamp: string): string => {
  const data = `${mpesaConfig.shortCode}${mpesaConfig.passkey}${timestamp}`;
  return Buffer.from(data).toString('base64');
};

/**
 * @desc    Initiate M-Pesa STK Push (with mock mode support)
 * @route   POST /api/mpesa/stkpush
 * @access  Authenticated
 */
async function initiateStkPush(req: AuthenticatedRequest, res: Response) {
  try {
    const { phoneNumber, amount, orderNumber, accountReference } = req.body;

    // Validation
    if (!phoneNumber || !amount || !orderNumber) {
      return res.status(400).json({ 
        message: "Phone number, amount, and order number are required" 
      });
    }

    // Format phone number (ensure it starts with 254)
    let formattedPhone = phoneNumber.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Generate mock checkout request ID
    const checkoutRequestId = `ws_CO_${Date.now()}${Math.random().toString(36).substring(7)}`;
    const merchantRequestId = `${Math.floor(Math.random() * 99999)}-${Date.now()}-1`;

    // MOCK MODE: Simulate STK Push without calling real API
    if (mpesaConfig.useMockMode) {
      console.log('🧪 MOCK M-PESA: STK Push initiated');
      console.log(`📱 Phone: ${formattedPhone}`);
      console.log(`💰 Amount: KES ${amount}`);
      console.log(`📦 Order: ${orderNumber}`);

      // Update order with mock checkout request ID
      await Order.update(
        { 
          mpesaCheckoutRequestId: checkoutRequestId,
          paymentMethod: 'mpesa'
        },
        { where: { orderNumber } }
      );

      // Simulate callback after 3 seconds (simulating user entering PIN)
      setTimeout(async () => {
        console.log('🧪 MOCK M-PESA: Simulating successful payment callback');
        
        try {
          const order = await Order.findOne({
            where: { mpesaCheckoutRequestId: checkoutRequestId }
          });

          if (order) {
            const mockReceiptNumber = `OGH${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
            
            await order.update({
              paymentStatus: 'completed',
              status: 'confirmed',
              mpesaReceiptNumber: mockReceiptNumber,
              mpesaTransactionDate: new Date(),
            });

            console.log(`✅ MOCK M-PESA: Payment completed - Receipt: ${mockReceiptNumber}`);
            console.log(`✅ Order ${orderNumber} updated: paymentStatus=completed, status=confirmed`);
          } else {
            console.log(`⚠️ MOCK M-PESA: Order not found for checkoutRequestId: ${checkoutRequestId}`);
          }
        } catch (error) {
          console.error('❌ MOCK M-PESA: Error updating order:', error);
        }
      }, 3000);

      return res.json({
        success: true,
        message: 'STK push sent successfully (MOCK MODE)',
        checkoutRequestId,
        merchantRequestId,
        responseCode: '0',
        responseDescription: 'Success. Request accepted for processing',
        customerMessage: 'Success. Request accepted for processing',
        mockMode: true,
      });
    }

    // REAL API MODE (when credentials are available)
    const accessToken = await getMpesaToken();
    const timestamp = getTimestamp();
    const password = generatePassword(timestamp);

    const baseUrl = mpesaConfig.environment === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke'
      : 'https://api.safaricom.co.ke';

    const stkPushData = {
      BusinessShortCode: mpesaConfig.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: mpesaConfig.shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: mpesaConfig.callbackUrl,
      AccountReference: accountReference || orderNumber,
      TransactionDesc: `Payment for order ${orderNumber}`,
    };

    const response = await axios.post(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      stkPushData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    await Order.update(
      { 
        mpesaCheckoutRequestId: response.data.CheckoutRequestID,
        paymentMethod: 'mpesa'
      },
      { where: { orderNumber } }
    );

    res.json({
      success: true,
      message: 'STK push sent successfully',
      checkoutRequestId: response.data.CheckoutRequestID,
      merchantRequestId: response.data.MerchantRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
      customerMessage: response.data.CustomerMessage,
    });

  } catch (error: any) {
    console.error('M-Pesa STK Push Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate M-Pesa payment',
      error: error.response?.data?.errorMessage || error.message,
    });
  }
}

/**
 * @desc    Handle M-Pesa callback
 * @route   POST /api/mpesa/callback
 * @access  Public (M-Pesa webhook)
 */
async function handleMpesaCallback(req: any, res: Response) {
  try {
    console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

    const { Body } = req.body;
    
    if (!Body || !Body.stkCallback) {
      return res.status(400).json({ message: 'Invalid callback data' });
    }

    const { stkCallback } = Body;
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

    // Find order by checkout request ID
    const order = await Order.findOne({
      where: { mpesaCheckoutRequestId: CheckoutRequestID }
    });

    if (!order) {
      console.log('Order not found for CheckoutRequestID:', CheckoutRequestID);
      return res.json({ ResultCode: 0, ResultDesc: 'Success' });
    }

    // ResultCode 0 means success
    if (ResultCode === 0) {
      // Extract payment details
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      const mpesaReceiptNumber = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const amount = callbackMetadata.find((item: any) => item.Name === 'Amount')?.Value;
      const phoneNumber = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

      // Update order as paid
      await order.update({
        paymentStatus: 'completed',
        status: 'confirmed',
        mpesaReceiptNumber,
        mpesaTransactionDate: new Date(),
      });

      console.log(`✅ Payment successful for order ${order.orderNumber}`);
      console.log(`Receipt Number: ${mpesaReceiptNumber}`);
      console.log(`Amount: ${amount}`);
      console.log(`Phone: ${phoneNumber}`);

    } else {
      // Payment failed
      await order.update({
        paymentStatus: 'failed',
        status: 'cancelled',
      });

      console.log(`❌ Payment failed for order ${order.orderNumber}`);
      console.log(`Result: ${ResultDesc}`);
    }

    // Always return success to M-Pesa
    res.json({
      ResultCode: 0,
      ResultDesc: 'Success',
    });

  } catch (error: any) {
    console.error('M-Pesa Callback Error:', error);
    // Still return success to prevent retries
    res.json({
      ResultCode: 0,
      ResultDesc: 'Success',
    });
  }
}

/**
 * @desc    Query M-Pesa transaction status (with mock mode support)
 * @route   POST /api/mpesa/query
 * @access  Authenticated
 */
async function queryTransactionStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { checkoutRequestId } = req.body;

    if (!checkoutRequestId) {
      return res.status(400).json({ message: 'Checkout request ID is required' });
    }

    // MOCK MODE: Return simulated transaction status
    if (mpesaConfig.useMockMode) {
      console.log('🧪 MOCK M-PESA: Querying transaction status for:', checkoutRequestId);
      
      const order = await Order.findOne({
        where: { mpesaCheckoutRequestId: checkoutRequestId }
      });

      if (!order) {
        console.log('⚠️ MOCK M-PESA: Order not found for checkoutRequestId');
        return res.json({
          success: true,
          resultCode: '1032',
          resultDesc: 'Request cancelled by user',
          mockMode: true,
        });
      }

      console.log(`📊 MOCK M-PESA: Order status - paymentStatus: ${order.paymentStatus}, status: ${order.status}`);

      // Check payment status
      if (order.paymentStatus === 'completed') {
        console.log('✅ MOCK M-PESA: Payment confirmed as completed');
        return res.json({
          success: true,
          resultCode: '0',
          resultDesc: 'The service request has been accepted successfully',
          responseCode: '0',
          responseDescription: 'Success',
          mockMode: true,
        });
      } else if (order.paymentStatus === 'failed') {
        console.log('❌ MOCK M-PESA: Payment marked as failed');
        return res.json({
          success: true,
          resultCode: '1',
          resultDesc: 'The balance is insufficient for the transaction',
          mockMode: true,
        });
      } else {
        // Still pending
        console.log('⏳ MOCK M-PESA: Payment still pending');
        return res.json({
          success: true,
          resultCode: '1037',
          resultDesc: 'DS timeout user cannot be reached',
          mockMode: true,
        });
      }
    }

    // REAL API MODE
    const accessToken = await getMpesaToken();
    const timestamp = getTimestamp();
    const password = generatePassword(timestamp);

    const baseUrl = mpesaConfig.environment === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke'
      : 'https://api.safaricom.co.ke';

    const response = await axios.post(
      `${baseUrl}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: mpesaConfig.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      success: true,
      resultCode: response.data.ResultCode,
      resultDesc: response.data.ResultDesc,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
    });

  } catch (error: any) {
    console.error('M-Pesa Query Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to query transaction status',
      error: error.response?.data?.errorMessage || error.message,
    });
  }
}

// Export functions
export { initiateStkPush, handleMpesaCallback, queryTransactionStatus };
