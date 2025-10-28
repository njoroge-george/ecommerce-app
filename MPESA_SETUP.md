# 📱 M-Pesa Payment Integration Guide

## Overview
This guide will help you set up real M-Pesa payment integration using Safaricom's Daraja API.

## ✅ Features Implemented

### Backend
- ✅ M-Pesa STK Push (Lipa Na M-Pesa Online)
- ✅ Payment callback handling
- ✅ Transaction status query
- ✅ Order payment tracking
- ✅ Receipt number storage

### Frontend
- ✅ M-Pesa payment dialog with stepper
- ✅ Phone number validation (Kenyan format)
- ✅ Real-time payment status polling
- ✅ User-friendly payment flow
- ✅ Success/error handling

## 🚀 Setup Instructions

### Step 1: Register for Daraja API

1. Visit [Safaricom Daraja Developer Portal](https://developer.safaricom.co.ke/)
2. Create an account
3. Create a new app (select "Lipa Na M-Pesa Online")
4. Note down:
   - Consumer Key
   - Consumer Secret
   - Passkey (for production)

### Step 2: Configure Backend

Update `/backend/.env` with your credentials:

```env
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey_here
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
```

**For Sandbox Testing:**
- Use test credentials from Daraja portal
- Shortcode: `174379` (sandbox)
- Test phone numbers provided by Safaricom

**For Production:**
- Use production credentials
- Your business shortcode (Till Number or Paybill)
- Your production passkey
- Set `MPESA_ENVIRONMENT=production`

### Step 3: Database Migration

The migration has been applied automatically. It adds these fields to the `orders` table:
- `mpesaCheckoutRequestId` - STK push request ID
- `mpesaReceiptNumber` - M-Pesa receipt number
- `mpesaTransactionDate` - Payment timestamp
- `paymentStatus` - pending, completed, failed, refunded

### Step 4: Expose Callback URL

For M-Pesa callbacks to work, your backend must be accessible from the internet.

**Options:**

#### A. Using ngrok (for testing)
```bash
# Install ngrok
npm install -g ngrok

# Expose your backend
ngrok http 5000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update MPESA_CALLBACK_URL in .env:
MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback
```

#### B. Using Production Server
- Deploy your backend to a server with a public IP
- Use your domain with HTTPS
- Example: `https://api.yourdomain.com/api/mpesa/callback`

### Step 5: Test the Integration

#### Sandbox Testing

1. Start the servers:
```bash
cd backend && npm run dev
cd frontend && npm run dev
```

2. Place an order and select "M-Pesa" as payment method

3. Use test phone numbers:
   - **Success:** `254708374149` (default PIN: `1234`)
   - **Failure:** `254711222333`

4. Enter PIN on the STK push prompt

5. Check console logs for callback data

#### Real Testing (Sandbox)

Visit Safaricom Daraja test credentials page for valid test credentials and phone numbers.

## 📡 API Endpoints

### 1. Initiate STK Push
```http
POST /api/mpesa/stkpush
Authorization: Bearer <token>

{
  "phoneNumber": "254712345678",
  "amount": 100,
  "orderNumber": "ORD-123456",
  "accountReference": "ORD-123456"
}
```

**Response:**
```json
{
  "success": true,
  "checkoutRequestId": "ws_CO_010320232010362712",
  "merchantRequestId": "25353-67854202-1",
  "responseCode": "0",
  "responseDescription": "Success",
  "customerMessage": "Success. Request accepted for processing"
}
```

### 2. Query Transaction Status
```http
POST /api/mpesa/query
Authorization: Bearer <token>

{
  "checkoutRequestId": "ws_CO_010320232010362712"
}
```

### 3. Callback (Called by Safaricom)
```http
POST /api/mpesa/callback

{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "25353-67854202-1",
      "CheckoutRequestID": "ws_CO_010320232010362712",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {
            "Name": "Amount",
            "Value": 100
          },
          {
            "Name": "MpesaReceiptNumber",
            "Value": "OGH123ABC"
          },
          {
            "Name": "PhoneNumber",
            "Value": 254712345678
          }
        ]
      }
    }
  }
}
```

## 🧪 Testing Scenarios

### Success Flow
1. User selects M-Pesa payment
2. Enters valid Kenyan phone number (07XX XXX XXX or 2547XX XXX XXX)
3. Clicks "Send STK Push"
4. Receives STK push on phone
5. Enters M-Pesa PIN
6. Payment confirmed automatically
7. Order status updated to "confirmed"
8. User redirected to order confirmation

### Failure Scenarios
- **Invalid Phone:** Error message shown immediately
- **User Cancels:** Payment marked as failed after 30 seconds
- **Insufficient Balance:** M-Pesa rejects, order marked as failed
- **Timeout:** After 1.5 minutes, user prompted to check M-Pesa messages

## 🔒 Security Best Practices

1. **Never expose credentials:**
   - Keep `.env` out of version control
   - Use environment variables in production

2. **Validate callback source:**
   - Verify Safaricom IP addresses (optional)
   - Always return success to prevent retries

3. **Handle duplicates:**
   - Use `CheckoutRequestID` to prevent duplicate processing

4. **Logging:**
   - Log all transactions for audit trail
   - Store receipt numbers securely

## 📊 Order Status Flow

```
Order Created
    ↓
paymentStatus: 'pending'
    ↓
M-Pesa STK Push Sent
    ↓
User Enters PIN
    ↓
Callback Received
    ↓ (Success)
paymentStatus: 'completed'
status: 'confirmed'
    ↓ (Failure)
paymentStatus: 'failed'
status: 'cancelled'
```

## 🐛 Troubleshooting

### "Failed to get M-Pesa access token"
- Check Consumer Key and Secret
- Verify internet connection
- Ensure environment is set correctly

### "STK push sent but no callback"
- Check callback URL is publicly accessible
- Verify ngrok is running
- Check backend logs for errors
- Ensure callback endpoint is not rate-limited

### "Payment successful but order not updated"
- Check callback logs in backend console
- Verify database connection
- Ensure CheckoutRequestID matches

### Phone number validation fails
- Use format: `0712345678` or `254712345678`
- Must be a valid Safaricom number (07XX or 01XX)

## 📱 User Instructions

### How to Pay with M-Pesa

1. Select M-Pesa as your payment method
2. Enter your M-Pesa registered phone number
3. Click "Send STK Push"
4. Wait for the payment prompt on your phone
5. Enter your M-Pesa PIN
6. Wait for confirmation (usually 5-10 seconds)
7. You'll see a success message and order confirmation

### Tips
- Ensure phone has network coverage
- Check M-Pesa balance before payment
- Keep phone unlocked during payment
- Don't close the payment dialog until confirmed

## 🎯 Next Steps

1. **Go Live:**
   - Apply for production credentials
   - Update environment to `production`
   - Use your business shortcode
   - Test with real transactions

2. **Enhanced Features:**
   - Add payment retry logic
   - Implement refunds
   - Add payment history page
   - Send SMS/email receipts
   - Add C2B (till number) payments

3. **Monitoring:**
   - Set up transaction monitoring
   - Add reconciliation reports
   - Track failed payments
   - Monitor callback success rate

## 📚 Resources

- [Daraja API Documentation](https://developer.safaricom.co.ke/Documentation)
- [Lipa Na M-Pesa Online API](https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate)
- [Test Credentials](https://developer.safaricom.co.ke/test_credentials)
- [Daraja Support](https://developer.safaricom.co.ke/support)

## 💡 Pro Tips

1. Always test in sandbox before going live
2. Keep backups of all transaction logs
3. Monitor callback success rate
4. Implement exponential backoff for retries
5. Cache access tokens (they expire after 1 hour)
6. Use transaction IDs for reconciliation
7. Implement webhook signature validation in production

---

**Need Help?** Check the Daraja API documentation or contact Safaricom support.

**Ready for Production?** Make sure you:
- ✅ Have tested extensively in sandbox
- ✅ Have production credentials
- ✅ Have a public HTTPS callback URL
- ✅ Have error handling and logging in place
- ✅ Have tested failure scenarios
- ✅ Have a process for handling disputes
