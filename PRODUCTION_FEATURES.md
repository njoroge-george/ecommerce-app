# EcoShop - Production Features Documentation

## 🎉 New Production-Ready Features

This document describes the four major features recently added to make EcoShop a production-ready e-commerce application.

---

## 1. 🎫 Coupon System

A complete coupon management system with admin controls and customer usage tracking.

### Features
- **Discount Types**: Percentage-based or fixed amount discounts
- **Usage Limits**: Set maximum redemption counts per coupon
- **Expiry Dates**: Automatic expiration handling
- **Minimum Purchase**: Require minimum cart value for coupon validity
- **Maximum Discount Cap**: Limit maximum discount for percentage coupons
- **Active/Inactive Status**: Enable/disable coupons without deletion

### Database Schema
```sql
CREATE TABLE coupons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discountType ENUM('percentage', 'fixed') NOT NULL,
  discountValue DECIMAL(10,2) NOT NULL,
  minPurchase DECIMAL(10,2) DEFAULT 0,
  maxDiscount DECIMAL(10,2),
  usageLimit INT,
  usedCount INT DEFAULT 0,
  expiryDate DATE,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### API Endpoints

#### Public Endpoints
- `POST /api/coupons/validate` - Validate coupon code with cart total
- `GET /api/coupons/active` - Get all active coupons

#### Protected Endpoints
- `POST /api/coupons/apply` - Apply coupon (increments usage count)

#### Admin Endpoints
- `GET /api/coupons` - Get all coupons
- `POST /api/coupons` - Create new coupon
- `PATCH /api/coupons/:id` - Update coupon
- `DELETE /api/coupons/:id` - Delete coupon

### Frontend Components
- **Admin**: `/dashboard/coupons` - Full CRUD management interface
- **Customer**: Checkout page includes coupon input with apply/remove functionality

### Sample Coupons
```javascript
WELCOME10  - 10% off all orders
SAVE20     - 20% off orders $100+
FLAT15     - $15 off any order
```

---

## 2. 💳 Payment Integration (Stripe)

Secure payment processing with Stripe integration.

### Features
- **Payment Intents**: Secure server-side payment creation
- **Multiple Payment Methods**: Card, Apple Pay, Google Pay (auto-enabled)
- **Payment Confirmation**: Real-time payment status tracking
- **Webhooks**: Handle payment events from Stripe
- **Refunds**: Admin can process refunds

### Environment Variables
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### API Endpoints
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment status
- `POST /api/payments/webhook` - Handle Stripe webhooks
- `GET /api/payments/methods` - Get saved payment methods
- `POST /api/payments/refund` - Create refund (admin only)

### Implementation
```typescript
// Creating a payment intent
const response = await axiosInstance.post("/payments/create-intent", {
  amount: 99.99,
  currency: "usd",
  orderNumber: "ORD-123456",
});
```

### Testing
Use Stripe test cards:
- `4242 4242 4242 4242` - Successful payment
- `4000 0000 0000 0002` - Card declined
- `4000 0025 0000 3155` - Requires authentication

---

## 3. 📧 Email Notifications

Automated email system for order confirmations and status updates.

### Features
- **Order Confirmation**: Sent immediately after order placement
- **Order Status Updates**: Sent when order status changes
- **Password Reset**: Secure password reset emails
- **HTML Templates**: Beautiful, responsive email designs
- **Error Handling**: Graceful failure (doesn't block orders)

### Email Types

#### 1. Order Confirmation Email
Sent when order is created
- Order number
- Customer details
- Itemized product list
- Total amount
- Shipping address

#### 2. Order Status Email
Sent when order status changes
- Order number
- Status update message
- Tracking number (for shipped orders)
- Track order button

#### 3. Password Reset Email
Sent for password reset requests
- Reset link with token
- 1-hour expiration warning
- Security information

### Environment Variables
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Gmail Setup
1. Go to Google Account settings
2. Enable 2-Step Verification
3. Generate App Password
4. Use App Password in `SMTP_PASS`

### Email Service Functions
```typescript
// Send order confirmation
await sendOrderConfirmationEmail(customerEmail, {
  orderNumber: "ORD-123",
  customerName: "John Doe",
  total: 99.99,
  items: [...],
  shippingAddress: "123 Main St..."
});

// Send status update
await sendOrderStatusEmail(customerEmail, {
  orderNumber: "ORD-123",
  customerName: "John Doe",
  status: "shipped",
  trackingNumber: "TRK-789"
});
```

---

## 4. 🎯 Product Recommendations

Intelligent product recommendation engine with multiple algorithms.

### Recommendation Types

#### 1. Related Products
**Algorithm**: Same category products  
**Endpoint**: `GET /api/recommendations/related/:productId`  
**Use Case**: Product detail pages
```javascript
// Returns products in same category as viewed product
```

#### 2. Frequently Bought Together
**Algorithm**: Co-occurrence analysis from order history  
**Endpoint**: `GET /api/recommendations/frequently-bought-together/:productId`  
**Use Case**: "Customers also bought" section
```javascript
// Analyzes orders containing the product
// Returns products most often purchased together
```

#### 3. Personalized Recommendations
**Algorithm**: User order history + category preferences  
**Endpoint**: `GET /api/recommendations/for-you`  
**Use Case**: Homepage "For You" section (authenticated users)
```javascript
// Analyzes user's past purchases
// Recommends similar products they haven't bought
```

#### 4. Trending Products
**Algorithm**: Most ordered in last 30 days  
**Endpoint**: `GET /api/recommendations/trending`  
**Use Case**: Homepage trending section
```javascript
// Counts product orders in last 30 days
// Returns top N products by order count
```

#### 5. New Arrivals
**Algorithm**: Latest products by creation date  
**Endpoint**: `GET /api/recommendations/new-arrivals`  
**Use Case**: Homepage new products section
```javascript
// Returns newest products
// Ordered by createdAt DESC
```

### Frontend Component
```tsx
import ProductRecommendations from "../components/ProductRecommendations";

// Usage
<ProductRecommendations 
  type="related" 
  productId={productId}
  limit={6} 
/>

<ProductRecommendations 
  type="for-you" 
  limit={8} 
/>

<ProductRecommendations 
  type="trending" 
  limit={10} 
/>
```

### API Parameters
- `type` - Recommendation algorithm to use
- `productId` - Required for "related" and "frequently-bought-together"
- `limit` - Maximum number of products to return (default: 6-12 depending on type)

---

## 🚀 Getting Started

### Backend Setup

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Configure environment variables**
```bash
# Copy .env.example to .env and fill in values
cp .env .env.local

# Required variables:
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=dashboard
JWT_SECRET=your_secret

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

3. **Run database migrations**
```bash
# Create coupons table
sudo mysql dashboard < backend/migrations/create-coupons-table.sql

# Add coupon fields to orders
sudo mysql dashboard < backend/migrations/alter-orders-add-coupon.sql
```

4. **Start backend server**
```bash
npm run dev
```

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Start development server**
```bash
npm run dev
```

3. **Access the application**
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

---

## 📊 Admin Features

### Coupon Management
1. Navigate to `/dashboard/coupons`
2. View all coupons with usage statistics
3. Create new coupons with:
   - Code (auto-converted to uppercase)
   - Description
   - Discount type (percentage/fixed)
   - Discount value
   - Minimum purchase requirement
   - Maximum discount cap
   - Usage limit
   - Expiry date
4. Edit/delete existing coupons
5. Copy coupon codes to clipboard

### Order Management
- View all orders with payment status
- Update order status (automatically sends email)
- Process refunds for paid orders

---

## 🧪 Testing

### Test Coupons
```
WELCOME10  - 10% off (no minimum)
SAVE20     - 20% off $100+ orders
FLAT15     - $15 off (no minimum)
```

### Test Credit Cards (Stripe)
```
Success:     4242 4242 4242 4242
Decline:     4000 0000 0000 0002
Auth Required: 4000 0025 0000 3155
```

### Test Email Flow
1. Create test order
2. Check console logs for email confirmation
3. Update order status in admin panel
4. Verify status email is logged

---

## 🔒 Security Features

1. **Authentication**: JWT-based auth for all protected endpoints
2. **Authorization**: Role-based access (admin/customer)
3. **Payment Security**: Stripe handles all card data (PCI compliant)
4. **Email Security**: SMTP authentication with app passwords
5. **Input Validation**: Server-side validation for all inputs
6. **SQL Injection Protection**: Sequelize parameterized queries

---

## 📈 Performance Considerations

1. **Email**: Non-blocking (failures don't affect orders)
2. **Recommendations**: Efficient SQL queries with indexing
3. **Payments**: Asynchronous webhook handling
4. **Coupons**: Cached active coupons query

---

## 🐛 Troubleshooting

### Email not sending
- Check SMTP credentials
- Enable "Less secure app access" or use App Password
- Check firewall allows port 587

### Payment failing
- Verify Stripe API keys
- Check webhook endpoint is accessible
- Test with Stripe test cards

### Recommendations empty
- Ensure products have categories
- Create test orders for co-occurrence data
- Check database has sufficient product data

---

## 📝 Future Enhancements

### Coupons
- [ ] User-specific coupons
- [ ] First-time buyer coupons
- [ ] Category-specific coupons
- [ ] BOGO (Buy One Get One) deals

### Payments
- [ ] PayPal integration
- [ ] Apple Pay / Google Pay native support
- [ ] Subscription payments
- [ ] Split payments

### Emails
- [ ] Email templates editor
- [ ] Multi-language support
- [ ] Email scheduling
- [ ] Promotional email campaigns

### Recommendations
- [ ] Collaborative filtering
- [ ] Machine learning models
- [ ] A/B testing framework
- [ ] Click tracking and analytics

---

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Material-UI Components](https://mui.com/)
- [Express.js Guide](https://expressjs.com/)

---

## 🤝 Support

For issues or questions:
1. Check this documentation
2. Review error logs in `/tmp/backend.log`
3. Check browser console for frontend errors
4. Verify all environment variables are set

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
