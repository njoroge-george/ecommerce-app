# 🔑 How to Get Safaricom Daraja API Credentials (Step-by-Step)

## Problem: Can't Login to Safaricom Developer Portal?

Here are solutions:

### Solution 1: Register Fresh Account
1. Visit https://developer.safaricom.co.ke/
2. Click **"Sign Up"** (not login)
3. Fill in:
   - Email address
   - Password (strong password required)
   - Organization name (can be anything)
4. Check your email for verification link
5. Verify your email
6. Login with new credentials

### Solution 2: Password Reset
1. Go to https://developer.safaricom.co.ke/login
2. Click **"Forgot Password?"**
3. Enter your email
4. Check email for reset link
5. Create new password
6. Login

### Solution 3: Use Different Email Provider
- Sometimes Safaricom blocks certain email domains
- Try using:
  - Gmail
  - Outlook/Hotmail
  - Yahoo
- Avoid using temporary email services

### Solution 4: Contact Safaricom Support
If still can't login:
- Email: apisupport@safaricom.co.ke
- Phone: +254 722 000 000
- Twitter: @SafaricomPLC

## Once Logged In:

### Step 1: Create New App
1. Go to "My Apps"
2. Click "Create New App"
3. Select **"Lipa Na M-Pesa Online"**
4. Fill in app details:
   - App Name: "EcoShop Payments"
   - Description: "E-commerce payment integration"
5. Click Create

### Step 2: Get Credentials
1. Click on your app
2. Under "Keys" tab, you'll see:
   - **Consumer Key** (starts with: `xyz123...`)
   - **Consumer Secret** (longer string)
3. Copy these to your `.env`:
   ```env
   MPESA_CONSUMER_KEY=your_consumer_key_here
   MPESA_CONSUMER_SECRET=your_consumer_secret_here
   ```

### Step 3: Get Passkey
1. Still in your app
2. Go to "Credentials" or "Settings"
3. Find **"Lipa Na M-Pesa Passkey"**
4. Copy to `.env`:
   ```env
   MPESA_PASSKEY=your_passkey_here
   ```

### Step 4: Test Credentials
Safaricom provides test credentials:
- **Test Shortcode**: `174379`
- **Test Phone**: `254708374149`
- **Test PIN**: `1234`

Update `.env`:
```env
MPESA_SHORTCODE=174379
MPESA_ENVIRONMENT=sandbox
MPESA_MOCK_MODE=false
```

### Step 5: Setup Callback URL
You need a public URL for callbacks. Use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Run ngrok
ngrok http 5000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update .env:
MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback
```

### Step 6: Test Payment
1. Restart your backend
2. Make a test order
3. Select M-Pesa payment
4. Enter test phone: `254708374149`
5. You'll get STK push on simulator
6. Enter PIN: `1234`
7. Payment confirms!

## Alternative: Keep Using Mock Mode

If you still can't get credentials, keep mock mode ON. Your app will work perfectly for:
- ✅ Demos
- ✅ Development
- ✅ Testing
- ✅ Portfolio projects
- ✅ Client presentations

Just tell users: "This is a demo using simulated payments"

## When You Get Credentials:

Simply change in `.env`:
```env
MPESA_MOCK_MODE=false
```

Everything else stays the same! 🚀

---

**Bottom Line:** 
- Mock mode = Perfect for testing and demos
- Real API = Needs Safaricom account (free for sandbox)
- Can't get account? Keep mock mode and explain it's a demo

Need help? The mock mode is production-quality code - it just simulates the payment instead of calling Safaricom.
